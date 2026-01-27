"use client";

import React from 'react';
import { X, ExternalLink, Terminal } from 'lucide-react';

interface HuggingFaceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function HuggingFaceDetailsModal({ isOpen, onClose, user }: HuggingFaceDetailsModalProps) {
    const hasHF = user?.stats?.huggingface?.username || user?.integrations?.huggingface?.username;
    if (!isOpen || !hasHF) return null;

    const stats = user.stats?.huggingface || user.integrations?.huggingface?.stats || {};
    const {
        models_count = 0,
        total_downloads = 0,
        spaces_count = 0
    } = stats;

    const username = user.stats?.huggingface?.username || user.integrations?.huggingface?.username;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/20]">
                    <div className="flex items-center gap-2">
                        <Terminal size={20} className="text-[#FFD21E]" />
                        <span className="font-semibold text-foreground">Hugging Face Details</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--secondary))] rounded transition-colors text-muted-foreground hover:text-foreground">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Models Published */}
                        <div className="flex flex-col items-center p-3 rounded-lg bg-[hsl(var(--secondary))/30] border border-transparent">
                            <span className="text-xl font-bold text-foreground">{models_count}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Models Published</span>
                        </div>

                        {/* Total Downloads */}
                        <div className="flex flex-col items-center p-3 rounded-lg bg-[hsl(var(--secondary))/30] border border-transparent">
                            <span className="text-xl font-bold text-foreground">{total_downloads.toLocaleString()}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Total Downloads</span>
                        </div>

                        {/* Spaces (Optional, adding since it's available) */}
                        <div className="col-span-2 flex flex-col items-center p-3 rounded-lg bg-[hsl(var(--secondary))/30] border border-transparent">
                            <span className="text-xl font-bold text-foreground">{spaces_count}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">Spaces Created</span>
                        </div>
                    </div>

                    {/* Redirect Button */}
                    <a
                        href={`https://huggingface.co/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-2 w-full py-3 bg-[#FFD21E] hover:bg-[#E5BD19] text-black rounded-lg font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <span>View Profile</span>
                        <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </div>
        </div>
    );
}
