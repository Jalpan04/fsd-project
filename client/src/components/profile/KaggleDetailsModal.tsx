"use client";

import React from 'react';
import { X, ExternalLink, Database } from 'lucide-react';

interface KaggleDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function KaggleDetailsModal({ isOpen, onClose, user }: KaggleDetailsModalProps) {
    const hasKaggle = user?.stats?.kaggle?.username || user?.integrations?.kaggle?.username;
    if (!isOpen || !hasKaggle) return null;

    const stats = user.stats?.kaggle || user.integrations?.kaggle?.stats || {};
    const {
        competitions = 0,
        datasets = 0,
        kernels = 0
    } = stats;

    const username = user.stats?.kaggle?.username || user.integrations?.kaggle?.username;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/20]">
                    <div className="flex items-center gap-2">
                        <Database size={20} className="text-[#20BEFF]" />
                        <span className="font-semibold text-foreground">Kaggle Details</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--secondary))] rounded transition-colors text-muted-foreground hover:text-foreground">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Datasets */}
                        <div className="flex flex-col items-center p-3 rounded-lg bg-[hsl(var(--secondary))/30] border border-transparent">
                            <span className="text-xl font-bold text-foreground">{datasets}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Datasets</span>
                        </div>

                        {/* Notebooks */}
                        <div className="flex flex-col items-center p-3 rounded-lg bg-[hsl(var(--secondary))/30] border border-transparent">
                            <span className="text-xl font-bold text-foreground">{kernels}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Notebooks</span>
                        </div>

                        {/* Competitions */}
                        <div className="flex flex-col items-center p-3 rounded-lg bg-[hsl(var(--secondary))/30] border border-transparent">
                            <span className="text-xl font-bold text-foreground">{competitions}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Competitions</span>
                        </div>
                    </div>

                    {/* Redirect Button */}
                    <a
                        href={`https://www.kaggle.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-2 w-full py-3 bg-[#20BEFF] hover:bg-[#1CA6DF] text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <span>View Kaggle Profile</span>
                        <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </div>
        </div>
    );
}
