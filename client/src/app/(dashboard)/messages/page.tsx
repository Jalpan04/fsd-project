"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import { Loader2 } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

export default function MessagesPage() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const searchParams = useSearchParams();
    const initialUserId = searchParams.get('userId');

    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null); // The user we are chatting with
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversationsAndTarget = async () => {
            if (!user) return;
            try {
                // 1. Fetch Conversations
                const { data: convs } = await api.get('/chat/conversations');
                setConversations(convs);

                // 2. Handle Initial User via Query Param
                if (initialUserId) {
                    // Check if already in conversation list
                    const existingConv = convs.find((c: any) => c.partner._id === initialUserId);
                    if (existingConv) {
                        setSelectedUser(existingConv.partner);
                    } else {
                        // Fetch user details to create a temporary "selectedUser" state
                        // Assuming we have an endpoint for this, or use search.
                        // We use the same endpoint as before but via api service.
                        const { data: userData } = await api.get(`/users/id/${initialUserId}`);
                        setSelectedUser(userData);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch conversations or target user", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchConversationsAndTarget();
    }, [user, initialUserId]);

    // Real-time Updates
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (data: any) => {
            const { message, sender } = data;

            setConversations(prev => {
                // Remove existing conversation with this user if present
                const filtered = prev.filter(c => c.partner._id !== sender._id);

                // Find existing conv to get current unread count
                const existing = prev.find(c => c.partner._id === sender._id);
                // We need to check selectedUser *inside* the updater to allow it to be fresh if we want to avoid dependency, 
                // BUT selectedUser state is in the outer scope. 
                // To avoid adding selectedUser to dependency (which causes re-subscribing on every click), 
                // we can use a ref for selectedUser OR just accept the re-subscription.
                // The error "changed size" implies the array literal length changed.

                // Let's rely on a Ref for the current selectedUser to avoid changing the listener constantly.
                return filtered; // Placeholder to be replaced by full logic below
            });
        };
        // Refill full logic via simple replacement
    }, [socket]); // We will revert to just socket and handle selectedUser via Ref or functional update tricks if needed.

    // Better approach: Use a ref to track selected ID so we don't need to rebuild the listener.
    const selectedUserRef = React.useRef(selectedUser);
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (data: any) => {
            const { message, sender } = data;

            setConversations(prev => {
                const filtered = prev.filter(c => c.partner._id !== sender._id);
                const existing = prev.find(c => c.partner._id === sender._id);

                // Use ref to check if chat is open
                const isCurrentChat = selectedUserRef.current?._id === sender._id;
                const newUnreadCount = isCurrentChat ? 0 : (existing?.unreadCount || 0) + 1;

                const updatedConv = {
                    _id: message.conversationId,
                    partner: sender,
                    lastMessage: message,
                    updatedAt: message.createdAt,
                    unreadCount: newUnreadCount
                };

                return [updatedConv, ...filtered];
            });
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket]);

    const handleMessageSent = (message: any) => {
        setConversations(prev => {
            // The partner is 'selectedUser'
            if (!selectedUser) return prev;

            // Add to top with new lastMessage
            const filtered = prev.filter(c => c.partner._id !== selectedUser._id);
            const updatedConv = {
                _id: message.conversationId,
                partner: selectedUser,
                lastMessage: message,
                updatedAt: message.createdAt,
                unreadCount: 0
            };
            return [updatedConv, ...filtered];
        });
    };

    const handleSelectConversation = (partner: any) => {
        setSelectedUser(partner);
        // clear unread count locally
        setConversations(prev => prev.map(c =>
            c.partner._id === partner._id ? { ...c, unreadCount: 0 } : c
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-cyan-500" size={32} />
            </div>
        );
    }

    // Calculate available users for "Start A Chat"
    // Filter users from following who are NOT present in existing conversations
    const availableUsers = (user?.following || [])
        .filter((u: any) => !conversations.some(c => c.partner._id === u._id))
        .sort((a: any, b: any) =>
            (a.displayName || a.username).localeCompare(b.displayName || b.username)
        );

    return (
        <div className="flex h-full bg-[hsl(var(--ide-bg))]">
            {/* Conversation List Sidebar */}
            <div className={`w-full md:w-80 border-r border-[hsl(var(--ide-border))] flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[hsl(var(--ide-border))]">
                    <h2 className="text-xl font-bold text-white">Messages</h2>
                </div>
                <ConversationList
                    conversations={conversations}
                    availableUsers={availableUsers}
                    selectedUserId={selectedUser?._id}
                    onSelect={handleSelectConversation}
                />
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                {selectedUser ? (
                    <ChatWindow
                        recipient={selectedUser}
                        onBack={() => setSelectedUser(null)}
                        onMessageSent={handleMessageSent}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
