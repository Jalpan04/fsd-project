"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Calendar, ExternalLink, Github, Linkedin, Code, Award, Briefcase, Users, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ActivityHeatmap from '@/components/profile/ActivityHeatmap';
import TechStackDisplay from '@/components/profile/TechStackDisplay';
import PinnedShowcase from '@/components/profile/PinnedShowcase';
import UserListModal from '@/components/profile/UserListModal';
import api from '@/lib/api';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [showFollowers, setShowFollowers] = React.useState(false);
    const [showFollowing, setShowFollowing] = React.useState(false);

    // Auto-sync if stale (> 24h)
    React.useEffect(() => {
        if (user?.integrations?.github?.username) {
            const lastSync = user.integrations.github.lastSync ? new Date(user.integrations.github.lastSync) : null;
            const oneDay = 24 * 60 * 60 * 1000;
            // Sync if never synced or older than 24 hours
            if (!lastSync || (new Date().getTime() - lastSync.getTime() > oneDay)) {
                console.log('Data stale, auto-syncing...');
                api.post('/users/sync-stats')
                    .then(() => console.log('Auto-sync complete'))
                    .catch(err => console.error('Auto-sync failed', err));
            }
        }
    }, [user]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
            </div>
        );
    }

    if (!user) return null;

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
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-sm" title="Online" />
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium">
                                    {user.headline || "Full Stack Developer"}
                                </span>
                            </div>
                        </div>

                        <p className="text-gray-400 font-medium mb-4">@{user.username}</p>

                        <p className="text-gray-300 text-base leading-relaxed max-w-2xl mb-6">
                            {user.bio || "Crafting digital experiences."}
                        </p>

                        {/* Socials - Horizontal Left Aligned */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
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
                            <a href={`mailto:${user.email}`} className="p-2 bg-emerald-900/20 hover:bg-emerald-900/30 text-emerald-400 rounded-md border border-emerald-900/30 transition-colors">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Dynamic Content Grid */}
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

                    {/* Left Column: Stack & Heatmap */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* 1. Activity Heatmap (Full Width) */}
                        <ActivityHeatmap username={user.username} />

                        {/* 2. Pinned Showcase */}
                        <PinnedShowcase
                            pinnedItems={user.developerProfile?.pinnedItems || []}
                            isOwnProfile={true}
                            onUpdate={() => window.location.reload()}
                        />
                    </div>
                </div>

                {/* Stats & Skills Grid (Moved Down) */}
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

                    {/* Stats */}
                    <div className="bg-[hsl(var(--ide-sidebar))]/50 backdrop-blur-md border border-[hsl(var(--ide-border))] rounded-lg p-6 hover:border-gray-600 transition-colors">
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-sm bg-cyan-500" /> Impact
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Followers */}
                            <div
                                onClick={() => setShowFollowers(true)}
                                className="p-4 rounded-md bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">{user.followers?.length || 0}</div>
                                    <Users size={18} className="text-cyan-500 opacity-60" />
                                </div>
                                <div className="text-xs text-cyan-200/60 font-medium uppercase tracking-wide">Followers</div>
                            </div>

                            {/* Following */}
                            <div
                                onClick={() => setShowFollowing(true)}
                                className="p-4 rounded-md bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">{user.following?.length || 0}</div>
                                    <UserCheck size={18} className="text-cyan-500 opacity-60" />
                                </div>
                                <div className="text-xs text-cyan-200/60 font-medium uppercase tracking-wide">Following</div>
                            </div>

                            {/* Projects */}
                            <div className="p-4 rounded-md bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{user.projects?.length || 0}</div>
                                    <Code size={18} className="text-emerald-500 opacity-60" />
                                </div>
                                <div className="text-xs text-emerald-200/60 font-medium uppercase tracking-wide">Projects</div>
                            </div>

                            {/* Certificates */}
                            <div className="p-4 rounded-md bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 hover:border-amber-500/40 transition-colors group">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">{user.certificates?.length || 0}</div>
                                    <Award size={18} className="text-amber-500 opacity-60" />
                                </div>
                                <div className="text-xs text-amber-200/60 font-medium uppercase tracking-wide">Certificates</div>
                            </div>
                        </div>

                    </div>

                    {/* Projects */}
                    <div
                        onClick={() => router.push('/projects')}
                        className="bg-[hsl(var(--ide-sidebar))]/50 backdrop-blur-md border border-[hsl(var(--ide-border))] rounded-lg p-6 hover:border-cyan-500/30 transition-all cursor-pointer group flex flex-col justify-between h-full"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                                <Briefcase size={24} />
                            </div>
                            <ExternalLink size={18} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                        </div>

                        {/* Recent Projects Preview */}
                        <div className="flex-1 flex flex-col justify-center gap-2 mb-4">
                            {user.projects && user.projects.length > 0 ? (
                                user.projects.slice(0, 2).map((project: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-cyan-500/5 border border-cyan-500/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                                        <span className="text-xs text-gray-300 truncate font-medium">{project.title}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-20 text-xs text-gray-600 italic">
                                    No projects yet
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">View Projects</h3>
                            <p className="text-gray-400 text-sm">Explore my portfolio and case studies.</p>
                        </div>
                    </div>

                    {/* Certificates */}
                    <div
                        onClick={() => router.push('/certificates')}
                        className="bg-[hsl(var(--ide-sidebar))]/50 backdrop-blur-md border border-[hsl(var(--ide-border))] rounded-lg p-6 hover:border-yellow-500/30 transition-all cursor-pointer group flex flex-col justify-between h-full"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
                                <Award size={24} />
                            </div>
                            <ExternalLink size={18} className="text-gray-500 group-hover:text-yellow-400 transition-colors" />
                        </div>

                        {/* Recent Certificates Preview */}
                        <div className="flex-1 flex flex-col justify-center gap-2 mb-4">
                            {user.certificates && user.certificates.length > 0 ? (
                                user.certificates.slice(0, 2).map((cert: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-yellow-500/5 border border-yellow-500/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs text-gray-300 truncate font-medium">{cert.name}</span>
                                            <span className="text-[10px] text-gray-500 truncate">{cert.issuer}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-20 text-xs text-gray-600 italic">
                                    No certificates yet
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">View Certificates</h3>
                            <p className="text-gray-400 text-sm">Check out my achievements and badges.</p>
                        </div>
                    </div>

                </div>

                {/* Tech Stack (Moved below main stats grid) */}
                <div className="w-full max-w-5xl mt-8 space-y-6">
                    <TechStackDisplay initialSkills={user.skills} />

                    {/* External Integrations Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Can add Kaggle/GitHub stats cards here later */}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center text-gray-600 text-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar size={14} /> <span>Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>

            </div>

            {/* Modals */}
            <UserListModal
                isOpen={showFollowers}
                onClose={() => setShowFollowers(false)}
                title="Followers"
                users={user.followers || []}
            />
            <UserListModal
                isOpen={showFollowing}
                onClose={() => setShowFollowing(false)}
                title="Following"
                users={user.following || []}
            />
        </div>
    );
}
