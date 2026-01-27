"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Search, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { FollowButton } from '@/components/shared/FollowButton';

interface SearchUser {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    headline?: string;
    skills: string[];
    followers: string[];
    following: string[];
    followRequests?: string[];
}

export default function SearchPage() {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await api.get(`/users/search?query=${query}`);
            setResults(response.data);
            setSearched(true);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Explore</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Discover developers, projects, and connect with the community.</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative mb-10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, username, or skills..."
                    className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-[hsl(var(--ring))] focus:ring-1 focus:ring-[hsl(var(--ring))] transition-all shadow-lg shadow-black/20"
                />
            </form>

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-[hsl(var(--primary))]" size={32} />
                </div>
            ) : (
                <div className="space-y-6">
                    {searched && results.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No developers found matching "{query}".
                        </div>
                    )}

                    {results.map((resUser) => (
                        <div key={resUser._id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 flex flex-col md:flex-row items-center md:items-start gap-5 hover:border-[hsl(var(--border))]/80 transition-colors shadow-sm">
                            {/* Avatar */}
                            <Link href={`/profile/${resUser.username}`}>
                                <div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden border-2 border-[hsl(var(--border))]">
                                    <img
                                        src={resUser.avatarUrl || `https://ui-avatars.com/api/?name=${resUser.username}&background=random`}
                                        alt={resUser.username}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Link>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left min-w-0">
                                <Link href={`/profile/${resUser.username}`}>
                                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                                        {resUser.displayName || resUser.username}
                                    </h3>
                                </Link>
                                <p className="text-[hsl(var(--primary))] text-sm font-medium mb-1">@{resUser.username}</p>
                                {resUser.headline && <p className="text-gray-400 text-sm mb-2">{resUser.headline}</p>}

                                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                                    {resUser.skills?.slice(0, 5).map(skill => (
                                        <span key={skill} className="bg-[hsl(var(--secondary))] text-gray-300 text-xs px-2 py-1 rounded border border-[hsl(var(--border))]">
                                            {skill}
                                        </span>
                                    ))}
                                    {(resUser.skills?.length || 0) > 5 && (
                                        <span className="text-xs text-gray-500 py-1">+{resUser.skills.length - 5} more</span>
                                    )}
                                </div>
                            </div>

                            {/* Action */}
                            <div className="shrink-0">
                                <FollowButton
                                    targetUserId={resUser._id}
                                    targetUserId={resUser._id}
                                    initialIsFollowing={user?.following?.some((u: any) => u._id === resUser._id) || false}
                                    initialIsRequested={!!(user && user.followRequests?.some((u: any) => u._id === resUser._id))}
                                />
                                <Link href={`/messages?userId=${resUser._id}`}>
                                    <button className="mt-2 flex items-center justify-center gap-2 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] rounded-full border border-[hsl(var(--border))] transition-colors text-xs font-bold px-4 py-1.5">
                                        <MessageCircle size={14} /> Message
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
