"use client";

import React, { useState } from 'react';
import { X, ExternalLink, Github, ArrowLeft } from 'lucide-react';
import UserListModal from '@/components/profile/UserListModal';
import axios from 'axios';

interface GitHubDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function GitHubDetailsModal({ isOpen, onClose, user }: GitHubDetailsModalProps) {
    const [view, setView] = useState<'stats' | 'followers' | 'following'>('stats');
    const [listData, setListData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const hasGithub = user?.stats?.github?.username || user?.integrations?.github?.username;
    if (!isOpen || !hasGithub) return null;

    const stats = user.stats?.github || user.integrations?.github?.stats || {};
    const { followers = 0, following = 0, total_stars = 0 } = stats;
    const username = user.stats?.github?.username || user.integrations?.github?.username || user.username;

    // Reset view when closing
    const handleClose = () => {
        setView('stats');
        setListData([]);
        onClose();
    };

    const fetchList = async (type: 'followers' | 'following') => {
        setLoading(true);
        setView(type);
        try {
            // Use the stored username for fetching
            const targetUsername = username || user.username;
            const res = await axios.get(`https://api.github.com/users/${targetUsername}/${type}`);

            const mapped = res.data.map((u: any) => ({
                _id: u.id,
                username: u.login,
                displayName: u.login,
                avatarUrl: u.avatar_url,
                headline: "GitHub User"
            }));
            setListData(mapped);
        } catch (error) {
            console.error(`Failed to fetch GitHub ${type}`, error);
        } finally {
            setLoading(false);
        }
    };

    // If viewing a list, render the UserListModal (or equivalent internal view)
    // We can wrap UserListModal or just render it if it supports back navigation.
    // UserListModal usually closes completely. Let's conditionally render it or just use its UI structure.
    // Actually, simpler: If view is NOT stats, render UserListModal with a custom "Back" behavior if possible, 
    // or just valid "Close" which closes everything. 
    // But user might want to go back to stats.
    // For now, let's keep it simple: List Modal is a separate overlay or replaces content.

    // RENDER: STATS VIEW
    if (view === 'stats') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-sm bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/20]">
                        <div className="flex items-center gap-2">
                            <Github size={20} className="text-[hsl(var(--foreground))]" />
                            <span className="font-semibold text-foreground">GitHub Details</span>
                        </div>
                        <button onClick={handleClose} className="p-1 hover:bg-[hsl(var(--secondary))] rounded transition-colors text-muted-foreground hover:text-foreground">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div
                                className="flex flex-col items-center p-3 rounded-lg bg-[hsl(var(--secondary))/30] hover:bg-[hsl(var(--secondary))] transition-colors cursor-pointer border border-transparent hover:border-[hsl(var(--border))]"
                                onClick={() => fetchList('followers')}
                            >
                                <span className="text-xl font-bold text-foreground">{followers}</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Followers</span>
                            </div>

                            <div
                                className="flex flex-col items-center p-3 rounded-lg bg-[hsl(var(--secondary))/30] hover:bg-[hsl(var(--secondary))] transition-colors cursor-pointer border border-transparent hover:border-[hsl(var(--border))]"
                                onClick={() => fetchList('following')}
                            >
                                <span className="text-xl font-bold text-foreground">{following}</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Following</span>
                            </div>

                            <div className="flex flex-col items-center p-3 rounded-lg bg-[hsl(var(--secondary))/30] border border-transparent">
                                <span className="text-xl font-bold text-foreground">{total_stars}</span>
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Stars</span>
                            </div>
                        </div>

                        {/* Redirect Button */}
                        <a
                            href={`https://github.com/${username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center gap-2 w-full py-3 bg-[#24292f] hover:bg-[#2b3137] text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <span>Go to GitHub Profile</span>
                            <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: LIST VIEW
    // reusing UserListModal logic but manual render to handle 'Back' to stats
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setView('stats')} className="p-1 hover:bg-[hsl(var(--secondary))] rounded text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-lg font-semibold text-foreground capitalize">
                            GitHub {view}
                        </h2>
                    </div>
                    <button onClick={handleClose} className="p-1 hover:bg-[hsl(var(--secondary))] rounded text-muted-foreground hover:text-foreground transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : listData.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No users found.
                        </div>
                    ) : (
                        listData.map((u) => (
                            <a
                                key={u._id}
                                href={`https://github.com/${u.username}`}
                                target="_blank"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors cursor-pointer group"
                            >
                                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border shrink-0">
                                    <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                        {u.displayName}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                                </div>
                                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
                            </a>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
