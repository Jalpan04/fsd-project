"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth'; // Re-use auth for token
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import { Loader2 } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

export default function MessagesPage() {
    const { user } = useAuth();
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

    const handleSelectConversation = (partner: any) => {
        setSelectedUser(partner);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-cyan-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex h-full bg-[hsl(var(--ide-bg))]">
            {/* Conversation List Sidebar */}
            <div className={`w-full md:w-80 border-r border-[hsl(var(--ide-border))] flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[hsl(var(--ide-border))]">
                    <h2 className="text-xl font-bold text-white">Messages</h2>
                </div>
                <ConversationList 
                    conversations={conversations} 
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
