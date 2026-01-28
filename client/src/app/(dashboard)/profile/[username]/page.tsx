"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Calendar, Github, Linkedin, Code, Award, Briefcase, Users, UserCheck, MessageCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { FollowButton } from '@/components/shared/FollowButton';

export default function PublicProfilePage() {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // If viewing own profile, redirect to private profile for editing capabilities? 
                // Or just show public view. Let's show public view for consistent URL.

                const { data } = await api.get(`/users/${username}`);
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch user", error);
            } finally {
                setLoading(false);
            }
        };

        if (username) fetchUser();
    }, [username]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                User not found
            </div>
        );
    }

    const isMe = currentUser?._id === user._id;

    return (
        <div className="h-full overflow-y-auto bg-[hsl(var(--ide-bg))] relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-cyan-900/20 via-[hsl(var(--ide-bg))] to-[hsl(var(--ide-bg))] pointer-events-none" />

            <div className="max-w-5xl mx-auto p-8 relative z-10 flex flex-col items-center">

                {/* Hero Profile Card */}
                <div className="w-full max-w-5xl bg-[hsl(var(--ide-sidebar))]/50 border border-[hsl(var(--ide-border))] rounded-lg p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">

                    {/* Avatar - Squarish Round */}
                    <div className="relative shrink-0">
                        <div className="w-32 h-32 rounded-xl p-1 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                            <div className="w-full h-full rounded-lg overflow-hidden bg-[hsl(var(--ide-bg))] border-2 border-[hsl(var(--ide-bg))]">
                                <img
                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-2">
                            <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                                {user.displayName || user.username}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium">
                                    {user.headline || "Developer"}
                                </span>
                            </div>
                        </div>

                        <p className="text-gray-400 font-medium mb-4">@{user.username}</p>

                        <p className="text-gray-300 text-base leading-relaxed max-w-2xl mb-6">
                            {user.bio || "Crafting digital experiences."}
                        </p>

                        {/* Actions (Follow / Message) */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            {!isMe && (
                                <>
                                    <FollowButton
                                        targetUserId={user._id}
                                        initialIsFollowing={currentUser?.following?.some((u: any) => u._id === user._id) || false}
                                        initialIsRequested={!!(currentUser && user.followRequests?.includes(currentUser._id))}
                                    />
                                    <button
                                        onClick={() => router.push(`/messages?userId=${user._id}`)}
                                        className="px-4 py-2 bg-[hsl(var(--secondary))] text-white rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors flex items-center gap-2 font-medium text-sm"
                                    >
                                        <MessageCircle size={16} /> Message
                                    </button>
                                </>
                            )}

                            {/* Social Icons */}
                            {user.socials?.github && (
                                <a href={user.socials.github} target="_blank" className="p-2 bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white rounded-md border border-gray-700 transition-colors">
                                    <Github size={18} />
                                </a>
                            )}
                            {user.socials?.linkedin && (
                                <a href={user.socials.linkedin} target="_blank" className="p-2 bg-cyan-900/20 hover:bg-cyan-900/30 text-cyan-400 rounded-md border border-cyan-900/30 transition-colors">
                                    <Linkedin size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats & Skills Grid */}
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Stats */}
                    <div className="bg-[hsl(var(--ide-sidebar))]/50 backdrop-blur-md border border-[hsl(var(--ide-border))] rounded-lg p-6 hover:border-gray-600 transition-colors">
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-sm bg-cyan-500" /> Impact
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Followers */}
                            <div className="p-4 rounded-md bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 transition-colors group">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">{user.followers?.length || 0}</div>
                                    <Users size={18} className="text-cyan-500 opacity-60" />
                                </div>
                                <div className="text-xs text-cyan-200/60 font-medium uppercase tracking-wide">Followers</div>
                            </div>

                            {/* Following */}
                            <div className="p-4 rounded-md bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{user.following?.length || 0}</div>
                                    <UserCheck size={18} className="text-emerald-500 opacity-60" />
                                </div>
                                <div className="text-xs text-emerald-200/60 font-medium uppercase tracking-wide">Following</div>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="lg:col-span-2 bg-[hsl(var(--ide-sidebar))]/50 backdrop-blur-md border border-[hsl(var(--ide-border))] rounded-lg p-6 hover:border-gray-600 transition-colors flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-sm bg-[hsl(var(--accent))]" /> Expertise
                            </h3>
                        </div>

                        <div className="flex-1">
                            {user.skills && user.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.map((skill: string) => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1.5 bg-[hsl(var(--ide-bg))] text-gray-300 rounded-md border border-[hsl(var(--ide-border))] text-sm font-medium shadow-sm hover:border-gray-500 hover:text-white transition-colors cursor-default"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm">No skills listed.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
