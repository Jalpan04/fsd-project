"use client";

import React from 'react';
import { Github, Code, Database, Terminal } from 'lucide-react';

interface ActivitySidebarProps {
    user: any;
}

export default function ActivitySidebar({ user }: ActivitySidebarProps) {
     if (!user) return null;
     
    return (
        <aside className="hidden xl:block w-[300px] shrink-0 sticky top-6 h-fit space-y-4">
            {/* Connected Accounts Only - Removed Fake Heatmap */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                    Connected Accounts
                </h3>
                <div className="space-y-2">
                    {user.stats?.github?.username ? (
                        <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border group-hover:bg-primary/10">
                                <Github size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground truncate">GitHub</div>
                                <div className="text-[10px] text-muted-foreground truncate">@{user.stats.github.username || user.username}</div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                    ) : null}
                    
                    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                             <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border group-hover:bg-primary/10">
                                <Code size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground truncate">LeetCode</div>
                                <div className="text-[10px] text-muted-foreground truncate">{user.stats?.leetcode?.username ? `@${user.stats.leetcode.username}` : 'Not connected'}</div>
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.stats?.leetcode?.username ? 'bg-primary' : 'bg-muted'}`} />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                             <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border group-hover:bg-primary/10">
                                    <Database size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground truncate">Kaggle</div>
                                <div className="text-[10px] text-muted-foreground truncate">{user.stats?.kaggle?.username ? `@${user.stats.kaggle.username}` : 'Not connected'}</div>
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.stats?.kaggle?.username ? 'bg-primary' : 'bg-muted'}`} />
                    </div>
                </div>
            </div>
        </aside>
    );
}
