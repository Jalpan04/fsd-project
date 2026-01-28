"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Bell, Heart, MessageSquare, Reply, UserPlus, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [recentlyAccepted, setRecentlyAccepted] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            markAllRead();
            // Poll for new notifications every 5 seconds
            const interval = setInterval(fetchNotifications, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all', {});
        } catch (error) {
            console.error('Error marking read', error);
        }
    };

    const clearAll = async () => {
        try {
            await api.delete('/notifications');
            setNotifications([]);
        } catch (error) {
            console.error('Error clearing notifications', error);
        }
    };

    const handleAccept = async (requester: any) => {
        try {
            await api.put(`/users/${requester._id}/accept`, {});
            setRecentlyAccepted(prev => [...prev, requester]);
            refreshUser();
        } catch (e) {
            console.error(e);
        }
    };

    const handleFollowBack = async (userId: string) => {
        try {
            await api.post(`/users/${userId}/follow`, {});
            refreshUser();
            // Optional: Show feedback? refreshUser will update 'following' list
        } catch (e) {
            console.error(e);
        }
    };

    const isFollowing = (userId: string) => {
        return user?.following?.some((u: any) => u._id === userId);
    };

    if (authLoading || loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-[550px] mx-auto py-8 px-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                    <Bell className="text-[hsl(var(--primary))]" /> Notifications
                </h1>
                <button onClick={clearAll} className="text-sm text-red-400 hover:text-red-300 transition-colors">
                    Clear All
                </button>
            </div>

            {/* Follow Requests Section */}
            {((user?.followRequests?.length > 0) || (recentlyAccepted.length > 0)) && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-[hsl(var(--foreground))] mb-3">Follow Requests</h2>
                    <div className="space-y-3">
                        {/* Pending Requests */}
                        {(user?.followRequests || [])
                            .filter((req: any) => !recentlyAccepted.find(r => r._id === req._id))
                            .map((requester: any) => (
                                <div key={requester._id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 flex items-center gap-4 shadow-sm">
                                    <Link href={`/profile/${requester.username}`}>
                                        <div className="w-12 h-12 rounded-full bg-[hsl(var(--secondary))] overflow-hidden border border-[hsl(var(--border))]">
                                            <img
                                                src={requester.avatarUrl || `https://ui-avatars.com/api/?name=${requester.username}&background=random`}
                                                alt={requester.username}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </Link>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[hsl(var(--foreground))] truncate">
                                                {requester.displayName || requester.username}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                                            @{requester.username} • {requester.headline || 'Developer'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAccept(requester)}
                                            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3 py-1.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.put(`/users/${requester._id}/reject`, {});
                                                    refreshUser();
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }}
                                            className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border border-[hsl(var(--border))] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-opacity-80 transition-opacity"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}

                        {/* Recently Accepted */}
                        {recentlyAccepted.map((requester: any) => (
                            <div key={requester._id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 flex items-center gap-4 shadow-sm opacity-75">
                                <Link href={`/profile/${requester.username}`}>
                                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--secondary))] overflow-hidden border border-[hsl(var(--border))]">
                                        <img
                                            src={requester.avatarUrl || `https://ui-avatars.com/api/?name=${requester.username}&background=random`}
                                            alt={requester.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[hsl(var(--foreground))] truncate">
                                            {requester.displayName || requester.username}
                                        </span>
                                    </div>
                                    <p className="text-sm text-green-500 font-medium truncate">
                                        Request Accepted
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {!isFollowing(requester._id) ? (
                                        <button
                                            onClick={() => handleFollowBack(requester._id)}
                                            className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border border-[hsl(var(--border))] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-opacity-80 transition-opacity"
                                        >
                                            Follow Back
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="bg-transparent text-[hsl(var(--muted-foreground))] px-3 py-1.5 rounded-lg text-sm font-medium cursor-default"
                                        >
                                            Following
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h2 className="text-lg font-bold text-[hsl(var(--foreground))] mb-3">Activity</h2>
            <div className="space-y-2">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-[hsl(var(--ide-sidebar))] border border-[hsl(var(--ide-border))] rounded-lg">
                        <p className="text-gray-500">No notifications yet.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`p-4 rounded-lg border flex items-start gap-4 transition-colors ${notification.read ? 'bg-[hsl(var(--ide-sidebar))] border-[hsl(var(--ide-border))] opacity-80' : 'bg-cyan-900/10 border-cyan-800'}`}
                        >
                            {/* Icon based on type */}
                            <div className="mt-1">
                                {notification.type === 'like' && <Heart size={20} className="text-red-500 fill-red-500" />}
                                {notification.type === 'comment' && <MessageSquare size={20} className="text-green-500 fill-green-500" />}
                                {notification.type === 'reply' && <Reply size={20} className="text-cyan-500" />}
                                {notification.type === 'follow_request' && <UserPlus size={20} className="text-blue-500" />}
                                {notification.type === 'follow_accept' && <UserCheck size={20} className="text-green-500" />}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="text-sm">
                                        <span className="font-bold text-white mr-1">
                                            {notification.sender.displayName || notification.sender.username}
                                        </span>
                                        <span className="text-gray-400">
                                            {notification.type === 'like' && 'liked your post'}
                                            {notification.type === 'comment' && 'commented on your post'}
                                            {notification.type === 'reply' && 'replied to your comment'}
                                            {notification.type === 'follow_request' && 'requested to follow you'}
                                            {notification.type === 'follow_accept' && 'request accepted'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                                        {formatDistanceToNow(new Date(notification.createdAt))} ago
                                    </span>
                                </div>

                                {notification.post && (
                                    <Link href={`/post/${notification.post.slug || notification.post._id}`}>
                                        <div className="text-xs text-gray-500 line-clamp-2 hover:text-cyan-400 hover:underline cursor-pointer border-l-2 border-gray-700 pl-2 mt-1">
                                            "{notification.post.content}"
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
