"use client";

// import UserListModal from '@/components/profile/UserListModal'; // Removed
// import { useState } from 'react'; // Removed
// import { Mail } from 'lucide-react'; // Removed Mail
import { Calendar, ExternalLink } from 'lucide-react';

interface ProfileSidebarProps {
    user: any;
    postCount: number;
    onFollowersClick?: () => void;
    onFollowingClick?: () => void;
}

export default function ProfileSidebar({ user, postCount, onFollowersClick, onFollowingClick }: ProfileSidebarProps) {
    if (!user) return null;

    return (
        <aside className="hidden lg:block w-[300px] shrink-0 sticky top-6 h-fit space-y-4">

            <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col items-center p-6 text-center shadow-sm">
                <div className="w-24 h-24 rounded-full bg-secondary overflow-hidden border-4 border-background shadow-xl mb-3 -mt-2">
                    <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-0.5">{user.displayName || user.username}</h1>
                <p className="text-muted-foreground text-xs mb-4">@{user.username}</p>
                <p className="text-foreground/80 text-xs mb-5 leading-relaxed bg-activity p-3 rounded-lg w-full border border-border text-left">
                    {user.bio || "No bio available."}
                </p>

                {/* User Meta */}
                <div className="w-full space-y-2 mb-5">
                    {/* Email removed as per request */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Calendar size={14} /> <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {user.socials?.blog && (
                        <a href={user.socials.blog} target="_blank" className="flex items-center gap-3 text-xs text-primary hover:underline">
                            <ExternalLink size={14} /> <span className="truncate">Website</span>
                        </a>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="flex justify-around w-full py-3 border-y border-border mb-5 bg-activity/50 rounded">
                    <div className="text-center p-1 rounded">
                        <div className="text-foreground font-bold text-base">{postCount}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Posts</div>
                    </div>
                    <div className="text-center cursor-pointer hover:bg-secondary/50 rounded p-1 transition-colors" onClick={onFollowersClick}>
                        <div className="text-foreground font-bold text-base">{user.followers?.length || 0}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Followers</div>
                    </div>
                    <div className="text-center cursor-pointer hover:bg-secondary/50 rounded p-1 transition-colors" onClick={onFollowingClick}>
                        <div className="text-foreground font-bold text-base">{user.following?.length || 0}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Following</div>
                    </div>
                </div>

                {/* Skills */}
                <div className="w-full text-left">
                    <h3 className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {user.skills && user.skills.length > 0 ? (
                            user.skills.map((skill: string) => (
                                <span key={skill} className="bg-secondary text-foreground px-2 py-0.5 rounded text-[10px] border border-border group-hover:border-primary/50 transition-colors">
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <span className="text-muted-foreground text-xs italic">No skills added.</span>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
