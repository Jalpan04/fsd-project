"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, LogOut, RefreshCw, Edit, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import EditProfileModal from '@/components/profile/EditProfileModal';
import IntegrationSettings from '@/components/profile/IntegrationSettings';

export default function SettingsPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Protect the route
    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    const handleSyncStats = async () => {
        setIsSyncing(true);
        try {
            await api.post('/users/sync-stats', {});
            alert('Stats synced successfully!');
            window.location.reload(); 
        } catch (error) {
            console.error('Failed to sync stats', error);
            alert('Failed to sync stats. Check console.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleUpdateProfile = () => {
         window.location.reload();
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account preferences and profile.</p>
            </header>

            {/* Pillar 1: Integrations */}
            <IntegrationSettings user={user} onUpdate={handleUpdateProfile} />

            <div className="space-y-6">
                
                {/* Profile Settings */}
                <section className="bg-[hsl(var(--ide-sidebar))] border border-[hsl(var(--ide-border))] rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-[hsl(var(--ide-border))] bg-black/20">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShieldCheck size={18} className="text-cyan-400"/> Profile & Account
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded transition-colors cursor-pointer" onClick={() => setIsEditing(true)}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-cyan-900/30 rounded text-cyan-400">
                                    <Edit size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Edit Profile</h3>
                                    <p className="text-sm text-gray-400">Update your bio, display name, and skills.</p>
                                </div>
                            </div>
                            <span className="text-gray-500 text-sm">Target: {user.username}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded transition-colors cursor-pointer" onClick={handleSyncStats}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-900/30 rounded text-green-400">
                                    {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Sync External Stats</h3>
                                    <p className="text-sm text-gray-400">Refresh data from GitHub and LeetCode.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-[hsl(var(--ide-sidebar))] border border-red-900/30 rounded-lg overflow-hidden">
                     <div className="p-4 border-b border-red-900/30 bg-red-900/10">
                        <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
                            Danger Zone
                        </h2>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-between p-3 hover:bg-red-900/20 rounded transition-colors cursor-pointer" onClick={logout}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-red-900/30 rounded text-red-400">
                                    <LogOut size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Log Out</h3>
                                    <p className="text-sm text-gray-400">Sign out of your account on this device.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {isEditing && (
                <EditProfileModal 
                    user={user} 
                    onClose={() => setIsEditing(false)} 
                    onUpdate={handleUpdateProfile} 
                />
            )}
        </div>
    );
}
