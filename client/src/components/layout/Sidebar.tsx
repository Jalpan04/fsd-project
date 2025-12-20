"use client";

import React from 'react';
import { Files, Search, GitGraph, Box, User, Settings, LayoutGrid, Bell, Briefcase, Award, BarChart2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    badge?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, isActive, onClick, badge }) => {
    return (
        <div 
            className={cn(
                "w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-300 relative group rounded-md mx-2",
                isActive ? "text-primary-foreground bg-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
            onClick={onClick}
        >
            <Icon size={24} strokeWidth={1.5} />
            {badge && (
                 <div className="absolute top-2 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-secondary" />
            )}
            {/* Tooltip */}
            <div className="absolute left-14 bg-popover border border-border text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md">
                {label}
            </div>
        </div>
    );
};

import { useSocket } from '@/context/SocketContext';
import { useState, useEffect } from 'react';

// ... SidebarItem ...

export function Sidebar() {
    const pathname = usePathname();
    const { socket } = useSocket();
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        if (!socket) return;
        const handleNotification = () => {
             setHasUnread(true);
             // Optional: Play sound
        };
        socket.on('new_notification', handleNotification);
        return () => {
            socket.off('new_notification', handleNotification);
        };
    }, [socket]);

    // Reset unread when visiting notifications page
    useEffect(() => {
        if (pathname === '/notifications') {
            setHasUnread(false);
        }
    }, [pathname]);

    return (
        <div className="w-16 h-full bg-secondary flex flex-col items-center py-4 border-r border-border z-50 gap-2">
            {/* 1. Feed */}
            <Link href="/feed">

                <SidebarItem 
                    icon={LayoutGrid} 
                    label="Feed" 
                    isActive={pathname === '/feed'} 
                />
            </Link>

            {/* 2. Explore / Search */}
            <Link href="/search">
                <SidebarItem 
                    icon={Search} 
                    label="Explore" 
                    isActive={pathname === '/search'} 
                />
            </Link>
            
            {/* 3. Profile */}
            <Link href="/profile">
                <SidebarItem 
                    icon={User} 
                    label="Profile" 
                    isActive={pathname === '/profile'} 
                />
            </Link>

            {/* 3. Stats */}
            <Link href="/stats">
                <SidebarItem 
                    icon={BarChart2} 
                    label="Stats" 
                    isActive={pathname === '/stats'} 
                />
            </Link>

            {/* 4. Notifications */}
            <Link href="/notifications">
                <SidebarItem 
                    icon={Bell} 
                    label="Notifications" 
                    isActive={pathname === '/notifications'} 
                    badge={hasUnread}
                />
            </Link>

            {/* 4.5. Messages */}
            <Link href="/messages">
                <SidebarItem 
                    icon={MessageSquare} 
                    label="Messages" 
                    isActive={pathname === '/messages'} 
                />
            </Link>

             <div className="h-px w-8 bg-border my-2" />

             {/* 5. Projects */}
            <Link href="/projects">
                <SidebarItem 
                    icon={Briefcase} 
                    label="Projects" 
                    isActive={pathname === '/projects'} 
                />
            </Link>

            {/* 6. Certificates */}
            <Link href="/certificates">
                <SidebarItem 
                    icon={Award} 
                    label="Certificates" 
                    isActive={pathname === '/certificates'} 
                />
            </Link>


            
            <div className="flex-1" /> {/* Spacer */}
            
            <Link href="/settings">
                <SidebarItem 
                    icon={Settings} 
                    label="Settings" 
                    isActive={pathname === '/settings'} 
                />
            </Link>
        </div>
    );
}
