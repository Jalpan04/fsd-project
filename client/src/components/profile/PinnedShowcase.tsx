import React, { useState } from 'react';
import { ExternalLink, X, Plus, Github, Database, Terminal } from 'lucide-react';
import api from '@/lib/api';

interface PinnedItem {
    type: 'repo' | 'pr' | 'notebook' | 'model' | 'post';
    platform: 'github' | 'kaggle' | 'huggingface';
    url: string;
    title: string;
    description: string;
    thumbnail?: string;
}

interface PinnedShowcaseProps {
    pinnedItems: PinnedItem[];
    isOwnProfile?: boolean;
    onUpdate?: () => void;
}

export default function PinnedShowcase({ pinnedItems = [], isOwnProfile = false, onUpdate }: PinnedShowcaseProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPin, setNewPin] = useState({
        type: 'repo',
        platform: 'github',
        url: '',
        title: '',
        description: ''
    });

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'github': return Github;
            case 'kaggle': return Database;
            case 'huggingface': return Terminal;
            default: return Github;
        }
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            repo: 'Repository',
            pr: 'Pull Request',
            notebook: 'Notebook',
            model: 'Model',
            post: 'Blog Post'
        };
        return labels[type as keyof typeof labels] || type;
    };

    const handleAddPin = async () => {
        try {
            await api.post('/users/profile/pin', newPin);
            if (onUpdate) onUpdate();
            setShowAddModal(false);
            setNewPin({ type: 'repo', platform: 'github', url: '', title: '', description: '' });
        } catch (error) {
            console.error('Add pin error:', error);
        }
    };

    const handleRemovePin = async (index: number) => {
        try {
            await api.delete(`/users/profile/pin/${index}`);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Remove pin error:', error);
        }
    };

    // New Design System Classes
    const cardClass = "bg-card border border-border rounded-lg overflow-hidden";
    const headerClass = "p-4 border-b border-border bg-black/20 flex items-center justify-between";
    const titleClass = "text-lg font-bold text-foreground";
    const gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4";
    const itemCardClass = "group relative bg-activity border border-border rounded-lg p-4 hover:border-primary/50 transition-all";

    return (
        <div className={cardClass}>
            <div className={headerClass}>
                <h3 className={titleClass}>Pinned Showcase</h3>
                {isOwnProfile && pinnedItems.length < 6 && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus size={16} />
                        Pin Item
                    </button>
                )}
            </div>

            {pinnedItems.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    <p>No pinned items yet</p>
                    {isOwnProfile && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-3 text-primary hover:text-primary/80 text-sm underline"
                        >
                            Add your first pinned item
                        </button>
                    )}
                </div>
            ) : (
                <div className={gridClass}>
                    {pinnedItems.map((item, index) => {
                        const PlatformIcon = getPlatformIcon(item.platform);
                        return (
                            <div
                                key={index}
                                className={itemCardClass}
                            >
                                {isOwnProfile && (
                                    <button
                                        onClick={() => handleRemovePin(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <PlatformIcon size={20} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-muted-foreground mb-1">{getTypeLabel(item.type)}</div>
                                        <h4 className="text-foreground font-medium text-sm truncate">{item.title}</h4>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
                                >
                                    View Project <ExternalLink size={14} />
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Pin Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-foreground mb-4">Pin an Item</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1.5">Type</label>
                                <select
                                    value={newPin.type}
                                    onChange={e => setNewPin({ ...newPin, type: e.target.value })}
                                    className="w-full bg-activity border border-input rounded px-3 py-2 text-foreground focus:border-primary outline-none"
                                >
                                    <option value="repo">Repository</option>
                                    <option value="pr">Pull Request</option>
                                    <option value="notebook">Notebook</option>
                                    <option value="model">Model</option>
                                    <option value="post">Blog Post</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-1.5">Platform</label>
                                <select
                                    value={newPin.platform}
                                    onChange={e => setNewPin({ ...newPin, platform: e.target.value })}
                                    className="w-full bg-activity border border-input rounded px-3 py-2 text-foreground focus:border-primary outline-none"
                                >
                                    <option value="github">GitHub</option>
                                    <option value="kaggle">Kaggle</option>
                                    <option value="huggingface">Hugging Face</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={newPin.title}
                                    onChange={e => setNewPin({ ...newPin, title: e.target.value })}
                                    placeholder="My Awesome Project"
                                    className="w-full bg-activity border border-input rounded px-3 py-2 text-foreground focus:border-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-1.5">Description</label>
                                <textarea
                                    value={newPin.description}
                                    onChange={e => setNewPin({ ...newPin, description: e.target.value })}
                                    placeholder="A brief description..."
                                    rows={3}
                                    className="w-full bg-activity border border-input rounded px-3 py-2 text-foreground focus:border-primary outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-muted-foreground mb-1.5">URL</label>
                                <input
                                    type="url"
                                    value={newPin.url}
                                    onChange={e => setNewPin({ ...newPin, url: e.target.value })}
                                    placeholder="https://github.com/username/repo"
                                    className="w-full bg-activity border border-input rounded px-3 py-2 text-foreground focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors border border-border"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddPin}
                                disabled={!newPin.title || !newPin.url}
                                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Pin Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
