
import React from 'react';
import { X, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    users: any[];
}

export default function UserListModal({ isOpen, onClose, title, users }: UserListModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
                    <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                            No users found.
                        </div>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user._id || user.username}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors cursor-pointer group"
                                onClick={() => {
                                    onClose();
                                    router.push(`/profile/${user.username}`);
                                }}
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
                                    <h3 className="text-sm font-medium text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                                        {user.displayName || user.username}
                                    </h3>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">@{user.username}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
