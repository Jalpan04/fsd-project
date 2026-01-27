"use client";

import React, { useState } from 'react';
import { Github, Code, Database, Terminal } from 'lucide-react';
import GitHubDetailsModal from '@/components/profile/GitHubDetailsModal';
import LeetCodeDetailsModal from '@/components/profile/LeetCodeDetailsModal';
import KaggleDetailsModal from '@/components/profile/KaggleDetailsModal';
import HuggingFaceDetailsModal from '@/components/profile/HuggingFaceDetailsModal';

interface ActivitySidebarProps {
    user: any;
}

export default function ActivitySidebar({ user }: ActivitySidebarProps) {
    const [showGitHubDetails, setShowGitHubDetails] = useState(false);
    const [showLeetCodeDetails, setShowLeetCodeDetails] = useState(false);
    const [showKaggleDetails, setShowKaggleDetails] = useState(false);
    const [showHuggingFaceDetails, setShowHuggingFaceDetails] = useState(false);

    if (!user) return null;

    // ... (render content)



    return (
        <aside className="hidden xl:block w-[300px] shrink-0 sticky top-6 h-fit space-y-4">
            {/* Connected Accounts Only - Removed Fake Heatmap */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                    Connected Accounts
                </h3>
                <div className="space-y-2">
                    {user.stats?.github?.username || user.integrations?.github?.username ? (
                        <>
                            <div
                                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                                onClick={() => setShowGitHubDetails(true)}
                            >
                                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border group-hover:bg-primary/10">
                                    <Github size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-foreground truncate">GitHub</div>
                                    <div className="text-[10px] text-muted-foreground truncate">@{user.stats?.github?.username || user.integrations?.github?.username || user.username}</div>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                            <GitHubDetailsModal
                                isOpen={showGitHubDetails}
                                onClose={() => setShowGitHubDetails(false)}
                                user={user}
                            />
                        </>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border opacity-60">
                            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border">
                                <Github size={16} className="text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground truncate">GitHub</div>
                                <div className="text-[10px] text-muted-foreground truncate">Not connected</div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                        </div>
                    )}

                    {/* LeetCode Integration */}
                    {user.stats?.leetcode?.username || user.integrations?.leetcode?.username ? (
                        <>
                            <div
                                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                                onClick={() => setShowLeetCodeDetails(true)}
                            >
                                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border group-hover:bg-primary/10">
                                    <Code size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-foreground truncate">LeetCode</div>
                                    <div className="text-[10px] text-muted-foreground truncate">@{user.stats?.leetcode?.username || user.integrations?.leetcode?.username}</div>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                            <LeetCodeDetailsModal
                                isOpen={showLeetCodeDetails}
                                onClose={() => setShowLeetCodeDetails(false)}
                                user={user}
                            />
                        </>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border opacity-60">
                            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border">
                                <Code size={16} className="text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground truncate">LeetCode</div>
                                <div className="text-[10px] text-muted-foreground truncate">Not connected</div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                        </div>
                    )}

                    {/* Kaggle Integration */}
                    {user.stats?.kaggle?.username || user.integrations?.kaggle?.username ? (
                        <>
                            <div
                                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                                onClick={() => setShowKaggleDetails(true)}
                            >
                                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border group-hover:bg-primary/10">
                                    <Database size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-foreground truncate">Kaggle</div>
                                    <div className="text-[10px] text-muted-foreground truncate">@{user.stats?.kaggle?.username || user.integrations?.kaggle?.username}</div>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                            <KaggleDetailsModal
                                isOpen={showKaggleDetails}
                                onClose={() => setShowKaggleDetails(false)}
                                user={user}
                            />
                        </>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border opacity-60">
                            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border">
                                <Database size={16} className="text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground truncate">Kaggle</div>
                                <div className="text-[10px] text-muted-foreground truncate">Not connected</div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                        </div>
                    )}
                    {/* Hugging Face Integration */}
                    {user.stats?.huggingface?.username || user.integrations?.huggingface?.username ? (
                        <>
                            <div
                                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                                onClick={() => setShowHuggingFaceDetails(true)}
                            >
                                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border group-hover:bg-primary/10">
                                    <Terminal size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-foreground truncate">Hugging Face</div>
                                    <div className="text-[10px] text-muted-foreground truncate">@{user.stats?.huggingface?.username || user.integrations?.huggingface?.username}</div>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                            <HuggingFaceDetailsModal
                                isOpen={showHuggingFaceDetails}
                                onClose={() => setShowHuggingFaceDetails(false)}
                                user={user}
                            />
                        </>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border opacity-60">
                            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border">
                                <Terminal size={16} className="text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground truncate">Hugging Face</div>
                                <div className="text-[10px] text-muted-foreground truncate">Not connected</div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
