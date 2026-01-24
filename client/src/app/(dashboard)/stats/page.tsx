"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, BarChart2, RefreshCw, Github, Code, Database, Smile, Calendar, GitBranch, Star, Users, Activity, Award, Trophy, Zap, Book, GraduationCap, Briefcase, Globe, Link, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import LeetCodeStatsCard from '@/components/profile/LeetCodeStatsCard';


const StatCard = ({ title, icon: Icon, color, children, connected }: any) => (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`}>
                <Icon size={20} />
            </div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            {connected && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">Connected</span>}
        </div>
        {children}
    </div>
);

export default function StatsPage() {
    const { user, loading, refreshUser } = useAuth();
    const router = useRouter();
    const [syncing, setSyncing] = React.useState(false);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [loading, user, router]);

    const handleSyncStats = async () => {
        setSyncing(true);
        try {
            await api.post('/users/sync-stats', {});
            refreshUser();
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            setSyncing(false);
        }
    }

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
    if (!user) return null;

    const integrations = user.integrations || {};
    // Map integration stats to a common stats object for easier access
    const stats = {
        github: integrations.github?.stats,
        leetcode: integrations.leetcode?.stats,
        kaggle: integrations.kaggle?.stats,
        huggingface: integrations.huggingface?.stats,
    };

    return (
        <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
            <header className="flex justify-between items-center mb-8 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <BarChart2 className="text-accent" /> Developer Stats
                    </h1>
                    <p className="text-muted-foreground mt-2">Live aggregated metrics from your coding activity.</p>
                </div>
                <button
                    onClick={handleSyncStats}
                    disabled={syncing}
                    className="bg-secondary hover:bg-secondary/80 text-foreground border border-border px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
                    {syncing ? "Syncing..." : "Sync Data"}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* GitHub Stats */}
                <StatCard title="GitHub" icon={Github} color="gray" connected={!!integrations.github?.username}>
                    {stats.github ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-secondary/50 rounded border border-border">
                                    <div className="text-2xl font-bold text-foreground">{stats.github.commits || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase">Commits</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded border border-border">
                                    <div className="text-2xl font-bold text-foreground">{stats.github.stars || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase">Stars</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded border border-border">
                                    <div className="text-2xl font-bold text-foreground">{stats.github.prs || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase">PRs</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded border border-border">
                                    <div className="text-2xl font-bold text-foreground">{stats.github.followers || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase">Followers</div>
                                </div>
                            </div>
                        </div>
                    ) : (integrations.github?.username ? (
                        <div className="text-sm text-yellow-500 flex items-center gap-2">
                            <RefreshCw size={14} className="animate-spin" /> Data sync required.
                        </div>
                    ) : <div className="text-muted-foreground text-sm">Not connected</div>)}
                </StatCard>

                {/* LeetCode Stats */}
                <StatCard title="LeetCode" icon={Code} color="yellow" connected={!!integrations.leetcode?.username}>
                    {stats.leetcode ? (
                        <LeetCodeStatsCard stats={stats.leetcode} username={integrations.leetcode?.username} />
                    ) : (integrations.leetcode?.username ? (
                        <div className="text-sm text-yellow-500 flex items-center gap-2">
                            <RefreshCw size={14} /> Data sync required.
                        </div>
                    ) : <div className="text-muted-foreground text-sm">Not connected</div>)}
                </StatCard>

                {/* Kaggle Stats */}
                <StatCard title="Kaggle" icon={Database} color="cyan" connected={!!integrations.kaggle?.username}>
                    {stats.kaggle ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-secondary/50 rounded border border-border">
                                    <div className="text-xl font-bold text-foreground">{stats.kaggle.competitions || 0}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Competitions</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded border border-border">
                                    <div className="text-xl font-bold text-foreground">{stats.kaggle.kernels || 0}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Kernels</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded border border-border">
                                    <div className="text-xl font-bold text-foreground">{stats.kaggle.discussions || 0}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Discussions</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded border border-border">
                                    <div className="text-xl font-bold text-foreground">{stats.kaggle.datasets || 0}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Datasets</div>
                                </div>
                            </div>
                        </div>
                    ) : (integrations.kaggle?.username ? (
                        <div className="text-sm text-yellow-500 flex items-center gap-2">
                            <RefreshCw size={14} /> Data sync required.
                        </div>
                    ) : <div className="text-muted-foreground text-sm">Not connected</div>)}
                </StatCard>

                {/* Hugging Face Stats */}
                <StatCard title="Hugging Face" icon={Smile} color="amber" connected={!!integrations.huggingface?.username}>
                    {stats.huggingface ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-secondary/50 rounded border border-border">
                                    <div className="text-xl font-bold text-foreground">{stats.huggingface.models || 0}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Models</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded border border-border">
                                    <div className="text-xl font-bold text-foreground">{stats.huggingface.spaces || 0}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Spaces</div>
                                </div>
                                <div className="col-span-2 p-3 bg-secondary/50 rounded border border-border flex justify-between items-center">
                                    <div className="text-[10px] text-muted-foreground uppercase">Total Likes</div>
                                    <div className="text-xl font-bold text-foreground">{stats.huggingface.likes || 0}</div>
                                </div>
                            </div>
                        </div>
                    ) : (integrations.huggingface?.username ? (
                        <div className="text-sm text-yellow-500 flex items-center gap-2">
                            <RefreshCw size={14} /> Data sync required.
                        </div>
                    ) : <div className="text-muted-foreground text-sm">Not connected</div>)}
                </StatCard>
            </div>
        </div>
    );
}
