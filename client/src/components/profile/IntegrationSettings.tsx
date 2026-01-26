import React, { useState } from 'react';
import api from '@/lib/api';
import {
    Github,
    Database,
    Code,
    Terminal,
    Check,
    Link as LinkIcon,
    RefreshCw,
} from 'lucide-react';

interface IntegrationSettingsProps {
    user: any;
    onUpdate?: () => void;
}

const PLATFORMS = [
    { id: 'github', label: 'GitHub', icon: Github, description: 'Sync commits, PRs, and stars.' },
    { id: 'leetcode', label: 'LeetCode', icon: Code, description: 'Sync problems solved and contest rating.' },
    { id: 'kaggle', label: 'Kaggle', icon: Database, description: 'Sync competitions, kernels, and datasets.' },
    { id: 'huggingface', label: 'Hugging Face', icon: Terminal, description: 'Sync models, spaces, and likes.' },
];

export default function IntegrationSettings({ user, onUpdate }: IntegrationSettingsProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [syncing, setSyncing] = useState<string | null>(null);

    const [forms, setForms] = useState<any>({
        github: { username: user?.integrations?.github?.username || '', accessToken: '' },
        leetcode: { username: user?.integrations?.leetcode?.username || '' },
        kaggle: { username: user?.integrations?.kaggle?.username || '', apiKey: '' },
        huggingface: { username: user?.integrations?.huggingface?.username || '', accessToken: '' },
    });

    const handleChange = (platform: string, field: string, value: string) => {
        setForms((prev: any) => ({
            ...prev,
            [platform]: { ...prev[platform], [field]: value },
        }));
    };

    // 🔗 CONNECT / UPDATE CREDENTIALS
    const handleConnect = async (platform: string) => {
        setLoading(platform);
        try {
            await api.post('/integrations/connect', {
                platform,
                ...forms[platform],
            });

            onUpdate?.();
        } catch (error: any) {
            console.error('Connect failed:', error.response?.data || error);
        } finally {
            setLoading(null);
        }
    };

    // 🔄 SYNC DATA
    const handleSync = async (platform: string) => {
        setSyncing(platform);
        try {
            await api.post('/integrations/sync', { platform });
        } catch (error: any) {
            console.error('Sync failed:', error.response?.data || error);
        } finally {
            setSyncing(null);
        }
    };

    const isConnected = (platform: string) =>
        Boolean(user?.integrations?.[platform]?.username);

    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-black/20">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <LinkIcon size={18} className="text-accent" />
                    External Integrations
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Sync your stats from other platforms to build your Dev Identity.
                </p>
            </div>

            <div className="divide-y divide-border">
                {PLATFORMS.map((p) => {
                    const connected = isConnected(p.id);
                    const Icon = p.icon;

                    return (
                        <div
                            key={p.id}
                            className="p-6 flex flex-col md:flex-row gap-6 hover:bg-black/5 transition-colors"
                        >
                            {/* LEFT */}
                            <div className="flex gap-4 md:w-1/3">
                                <div
                                    className={`p-3 rounded-xl h-fit border ${connected
                                            ? 'bg-primary/10 border-primary/30 text-primary'
                                            : 'bg-secondary border-border text-muted-foreground'
                                        }`}
                                >
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        {p.label}
                                        {connected && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                                                <Check size={10} /> Active
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {p.description}
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        placeholder="Username"
                                        className="w-full bg-activity border border-input rounded-md px-3 py-2 text-sm"
                                        value={forms[p.id]?.username || ''}
                                        onChange={(e) =>
                                            handleChange(p.id, 'username', e.target.value)
                                        }
                                    />

                                    {(p.id === 'github' ||
                                        p.id === 'kaggle' ||
                                        p.id === 'huggingface') && (
                                            <input
                                                type="password"
                                                placeholder={
                                                    p.id === 'kaggle'
                                                        ? 'API Key (Optional)'
                                                        : 'Access Token (Optional)'
                                                }
                                                className="w-full bg-activity border border-input rounded-md px-3 py-2 text-sm"
                                                value={
                                                    p.id === 'kaggle'
                                                        ? forms[p.id]?.apiKey
                                                        : forms[p.id]?.accessToken || ''
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        p.id,
                                                        p.id === 'kaggle' ? 'apiKey' : 'accessToken',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        )}
                                </div>

                                <div className="flex justify-end gap-3 pt-1">
                                    <button
                                        onClick={() => handleConnect(p.id)}
                                        disabled={loading === p.id}
                                        className="px-4 py-2 bg-secondary border rounded-md text-sm disabled:opacity-50"
                                    >
                                        {loading === p.id
                                            ? 'Saving...'
                                            : connected
                                                ? 'Update Creds'
                                                : 'Save Credentials'}
                                    </button>

                                    <button
                                        onClick={() => handleSync(p.id)}
                                        disabled={!connected || syncing === p.id}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
                                    >
                                        <RefreshCw
                                            size={14}
                                            className={syncing === p.id ? 'animate-spin' : ''}
                                        />
                                        {syncing === p.id ? 'Syncing...' : 'Sync Data'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
