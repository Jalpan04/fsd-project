"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Calendar, MapPin, ExternalLink, Github, Linkedin, Code, Award, Briefcase, Users, UserCheck, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ActivityHeatmap from '@/components/profile/ActivityHeatmap';
import TechStackDisplay from '@/components/profile/TechStackDisplay';
import PinnedShowcase from '@/components/profile/PinnedShowcase';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

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

                    {/* Stats & Skills were here. Let's reorganize. */}
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
                            <div className="p-4 rounded-md bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 transition-colors group">
                                <div className="flex items-start justify-between mb-2">
                                     <div className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">{user.followers?.length || 0}</div>
                                     <Users size={18} className="text-cyan-500 opacity-60" />
                                </div>
                                <div className="text-xs text-cyan-200/60 font-medium uppercase tracking-wide">Followers</div>
                            </div>

                            {/* Following */}
                            <div className="p-4 rounded-md bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 transition-colors group">
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

                    {/* Tech Stack (Replaces Metadata Skills) */}
                    <div className="lg:col-span-2">
                         <TechStackDisplay skills={user.skills} />
                    </div>

                    <div className="lg:col-span-3">
                        {/* Quick Actions moved to bottom full width if needed, or keep in sidebar */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <button 
                                onClick={() => router.push('/projects')}
                                className="flex items-center justify-between p-4 rounded-md bg-gradient-to-r from-cyan-900/10 to-transparent border border-cyan-900/20 hover:border-cyan-500/30 group transition-all"
                            >
                                <span className="flex items-center gap-3 text-cyan-200">
                                    <Briefcase size={18} /> View Projects
                                </span>
                                <ExternalLink size={16} className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                             </button>

                             <button 
                                onClick={() => router.push('/certificates')}
                                className="flex items-center justify-between p-4 rounded-md bg-gradient-to-r from-yellow-900/10 to-transparent border border-yellow-900/20 hover:border-yellow-500/30 group transition-all"
                            >
                                <span className="flex items-center gap-3 text-yellow-200">
                                    <Award size={18} /> View Certificates
                                </span>
                                <ExternalLink size={16} className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                             </button>
                         </div>
                    </div>

                </div>
                
                 {/* Footer Info */}
                <div className="mt-12 text-center text-gray-600 text-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar size={14} /> <span>Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
