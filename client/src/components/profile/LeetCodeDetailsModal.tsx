"use client";

import React from 'react';
import { X, ExternalLink, Code } from 'lucide-react';

interface LeetCodeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function LeetCodeDetailsModal({ isOpen, onClose, user }: LeetCodeDetailsModalProps) {
    if (!isOpen || !user?.stats?.leetcode) return null;

    const {
        ranking,
        total_solved,
        total_questions,
        username
    } = user.stats.leetcode;

    // Use the stored username or fallback to the main username if it matches (though integration usually stores its own)
    const targetUsername = username || user.username;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/20]">
                    <div className="flex items-center gap-2">
                        <Code size={20} className="text-[#ffc01e]" />
                        <span className="font-semibold text-foreground">LeetCode Details</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--secondary))] rounded transition-colors text-muted-foreground hover:text-foreground">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Solved */}
                        <div className="flex flex-col items-center p-4 rounded-lg bg-[hsl(var(--secondary))/30] border border-transparent">
                            <span className="text-xl font-bold text-foreground">
                                {total_solved}
                                <span className="text-xs text-muted-foreground font-medium ml-1">/{total_questions}</span>
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Solved</span>
                        </div>

                        {/* Ranking */}
                        <div className="flex flex-col items-center p-4 rounded-lg bg-[hsl(var(--secondary))/30] border border-transparent">
                            <span className="text-xl font-bold text-foreground">
                                {ranking ? ranking.toLocaleString() : 'N/A'}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Global Rank</span>
                        </div>
                    </div>

                    {/* Redirect Button */}
                    <a
                        href={`https://leetcode.com/${targetUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-2 w-full py-3 bg-[#282828] hover:bg-[#323232] text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 border border-gray-700"
                    >
                        <span>View Profile</span>
                        <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </div>
        </div>
    );
}
