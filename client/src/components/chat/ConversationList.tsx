import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Search, Circle } from 'lucide-react';

interface ConversationListProps {
    conversations: any[];
    selectedUserId?: string;
    availableUsers?: any[];
    onSelect: (partner: any) => void;
}

export default function ConversationList({ conversations, selectedUserId, availableUsers = [], onSelect }: ConversationListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter(conv => {
        const query = searchQuery.toLowerCase();
        const display = (conv.partner.displayName || '').toLowerCase();
        const user = (conv.partner.username || '').toLowerCase();
        return display.includes(query) || user.includes(query);
    });

    const filteredAvailableUsers = availableUsers.filter(u => {
        const query = searchQuery.toLowerCase();
        const display = (u.displayName || '').toLowerCase();
        const user = (u.username || '').toLowerCase();
        return display.includes(query) || user.includes(query);
    });

    return (
        <div className="flex flex-col h-full">
            {/* Search Bar - Tech Style */}
            <div className="p-4 border-b border-[hsl(var(--ide-border))] bg-[hsl(var(--ide-sidebar))]/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Filter signals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-[hsl(var(--ide-border))] rounded-md pl-9 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-900/5 transition-all font-mono placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1 p-2">
                {filteredConversations.length === 0 && filteredAvailableUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 text-xs font-mono tracking-widest uppercase">
                        No active signals
                    </div>
                ) : (
                    <>
                        {filteredConversations.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Active</h3>
                                {filteredConversations.map((conv) => {
                                    const isSelected = selectedUserId === conv.partner._id;
                                    return (
                                        <div
                                            key={conv._id}
                                            onClick={() => onSelect(conv.partner)}
                                            className={`group p-3 flex items-center gap-3 cursor-pointer rounded-lg border transition-all duration-200 ${isSelected
                                                ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/30'
                                                : 'bg-transparent border-transparent hover:bg-white/5 hover:border-gray-800'
                                                }`}
                                        >
                                            <div className="relative">
                                                <div className={`absolute -inset-0.5 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity ${isSelected ? 'bg-cyan-500 opacity-30' : 'bg-gray-500'}`} />
                                                <img
                                                    src={conv.partner.avatarUrl || `https://ui-avatars.com/api/?name=${conv.partner.username}&background=0f172a&color=06b6d4`}
                                                    alt={conv.partner.username}
                                                    className="relative w-10 h-10 rounded-lg object-cover bg-black"
                                                />
                                                {/* Status Dot */}
                                                <div className="absolute -bottom-1 -right-1 bg-black p-0.5 rounded-full">
                                                    <Circle size={10} className="text-emerald-500 fill-current" />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                        {conv.partner.displayName || conv.partner.username}
                                                    </h3>
                                                    {conv.updatedAt && (
                                                        <span className={`text-[10px] font-mono ${isSelected ? 'text-cyan-300' : 'text-gray-600'}`}>
                                                            {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false }).replace('about ', '')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-xs truncate font-mono ${isSelected ? 'text-cyan-200/60' : 'text-gray-500'} flex-1`}>
                                                        <span className="opacity-50 mr-1">{'>'}</span>
                                                        {(() => {
                                                            const msg = conv.lastMessage;
                                                            if (!msg) return 'Initialize connection...';
                                                            if (msg.content) return msg.content;
                                                            if (msg.sharedPost) return 'Shared a post';
                                                            if (msg.image) return 'Sent an image';
                                                            return 'Message';
                                                        })()}
                                                    </p>

                                                    {conv.unreadCount > 0 && (
                                                        <span className="ml-2 bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Active Indicator Bar */}
                                            {isSelected && (
                                                <div className="w-1 h-8 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {filteredAvailableUsers.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Start A Chat</h3>
                                {filteredAvailableUsers.map((user) => {
                                    // Should check if we are somehow "chatting" with them but not saved? 
                                    // Usually selectedUserId would match if we clicked them.
                                    const isSelected = selectedUserId === user._id;
                                    return (
                                        <div
                                            key={user._id}
                                            onClick={() => onSelect(user)}
                                            className={`group p-3 flex items-center gap-3 cursor-pointer rounded-lg border transition-all duration-200 ${isSelected
                                                ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/30'
                                                : 'bg-transparent border-transparent hover:bg-white/5 hover:border-gray-800'
                                                }`}
                                        >
                                            <div className="relative">
                                                <div className={`absolute -inset-0.5 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity ${isSelected ? 'bg-cyan-500 opacity-30' : 'bg-gray-500'}`} />
                                                <img
                                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=0f172a&color=06b6d4`}
                                                    alt={user.username}
                                                    className="relative w-10 h-10 rounded-lg object-cover bg-black"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                        {user.displayName || user.username}
                                                    </h3>
                                                </div>
                                                <p className="text-xs truncate font-mono text-gray-500">
                                                    Start a new conversation
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
