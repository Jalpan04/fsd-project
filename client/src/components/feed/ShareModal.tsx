import React, { useState } from 'react';
import { X, Search, Check, Send, User } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface User {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
}

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    onSend: (selectedUserIds: string[]) => Promise<void>;
}

export default function ShareModal({ isOpen, onClose, users, onSend }: ShareModalProps) {
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const filteredUsers = users.filter(u =>
        (u.displayName || u.username).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSend = async () => {
        if (selectedUserIds.length === 0) return;
        setSending(true);
        try {
            await onSend(selectedUserIds);
            onClose();
            setSelectedUserIds([]);
        } catch (error) {
            console.error("Send failed", error);
        } finally {
            setSending(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
                    <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Share Post</h2>
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-[hsl(var(--border))]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
                        <input
                            type="text"
                            placeholder="Search followers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[hsl(var(--muted))] border-none rounded-md pl-9 pr-4 py-2 text-sm text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                        />
                    </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                            No users found.
                        </div>
                    ) : (
                        filteredUsers.map(user => {
                            const isSelected = selectedUserIds.includes(user._id);
                            return (
                                <div
                                    key={user._id}
                                    onClick={() => toggleUser(user._id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group ${isSelected
                                            ? 'bg-[hsl(var(--secondary))]'
                                            : 'hover:bg-[hsl(var(--secondary))]'
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))] overflow-hidden border border-[hsl(var(--border))] shrink-0">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                                                <User size={16} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-medium truncate transition-colors ${isSelected ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>
                                            {user.displayName || user.username}
                                        </h3>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">@{user.username}</p>
                                    </div>

                                    {/* Selection Indicator */}
                                    {isSelected && (
                                        <div className="text-[hsl(var(--primary))] animate-in zoom-in-50 duration-200">
                                            <Check size={18} />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[hsl(var(--border))] flex justify-end">
                    <button
                        onClick={handleSend}
                        disabled={selectedUserIds.length === 0 || sending}
                        className="flex items-center gap-2 px-6 py-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/90] text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-sm"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Send {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
