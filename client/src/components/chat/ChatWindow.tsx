import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import { Send, ArrowLeft, MoreVertical, Paperclip, Smile, Check, CheckCheck, Clock, X, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
    recipient: any;
    onBack: () => void;
}

interface Message {
    _id: string;
    sender: string; // ID
    content: string;
    image?: string;
    createdAt: string;
    read?: boolean;
}

export default function ChatWindow({ recipient, onBack }: ChatWindowProps) {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const markMessagesAsRead = async () => {
        if (!user || !recipient) return;
        try {
            await api.put(`/chat/${recipient._id}/read`, {});
        } catch (error) {
            console.error("Mark read failed", error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user || !recipient) return;
            try {
                // 1. Mark as read immediately when opening
                await api.put(`/chat/${recipient._id}/read`, {});

                // 2. Fetch messages
                const { data } = await api.get(`/chat/${recipient._id}`);
                setMessages(data);
                scrollToBottom();
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };
        fetchMessages();
    }, [recipient, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, previewUrl]);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (data: any) => {
            if (data.sender._id === recipient._id) {
                setMessages((prev) => [...prev, data.message]);
                setIsTyping(false); // Stop typing if message received
                markMessagesAsRead(); // Mark incoming as read if window is open
            }
        };

        const handleTyping = (data: any) => {
             if (data.senderId === recipient._id) {
                 setIsTyping(true);
             }
        };

        const handleStopTyping = (data: any) => {
            if (data.senderId === recipient._id) {
                setIsTyping(false);
            }
        };

        const handleMessagesRead = (data: any) => {
            // If the other person read OUR messages
            if (data.readerId === recipient._id) {
                setMessages(prev => prev.map(msg => 
                    msg.sender === user?._id ? { ...msg, read: true } : msg
                ));
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('typing', handleTyping);
        socket.on('stop_typing', handleStopTyping);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('typing', handleTyping);
            socket.off('stop_typing', handleStopTyping);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [socket, recipient]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!socket || !recipient) return;

        // Emit typing event
        socket.emit('typing', { recipientId: recipient._id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { recipientId: recipient._id });
        }, 2000);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if ((!newMessage.trim() && !selectedFile) || !user) return;
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket?.emit('stop_typing', { recipientId: recipient._id });

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('recipientId', recipient._id);
            if (newMessage.trim()) formData.append('content', newMessage);
            if (selectedFile) formData.append('image', selectedFile);

            const { data } = await api.post('/chat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setMessages((prev) => [...prev, data]);
            setNewMessage('');
            clearFile();
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--ide-bg))] relative overflow-hidden">
            
            {/* Background Grid Pattern for Tech Feel */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#4f4f4f 1px, transparent 1px), linear-gradient(90deg, #4f4f4f 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Header - Glassmorphic */}
            <div className="p-4 flex items-center justify-between sticky top-0 bg-[hsl(var(--ide-bg))]/80 backdrop-blur-md border-b border-[hsl(var(--ide-border))] z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    
                    <div className="relative">
                        <img 
                            src={recipient.avatarUrl || `https://ui-avatars.com/api/?name=${recipient.username}&background=0f172a&color=3b82f6`} 
                            className="w-10 h-10 rounded-lg object-cover bg-black border border-gray-700"
                            alt={recipient.username}
                        />
                         <div className="absolute -bottom-1 -right-1 bg-black p-0.5 rounded-full">
                            <span className="block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">{recipient.displayName || recipient.username}</h3>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-mono">● Secured Connect</span>
                        </div>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col justify-end min-h-0 relative z-10">
                <div className="flex-1" /> {/* Scroll spacer */}
                
                {messages.length === 0 && (
                     <div className="text-center text-gray-600 my-auto">
                        <div className="w-16 h-16 mx-auto mb-4 border border-dashed border-gray-700 rounded-full flex items-center justify-center">
                             <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                        </div>
                        <p className="font-mono text-sm">INITIALIZING UPLINK...</p>
                        <p className="text-xs mt-2 opacity-50">Send a packet to begin.</p>
                     </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = msg.sender === user?._id;
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    const imageUrl = msg.image ? (msg.image.startsWith('http') ? msg.image : `${API_URL}${msg.image}`) : null;

                    return (
                        <div key={msg._id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                            <div className={`max-w-[75%] relative ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                
                                {/* Image Attachment */}
                                {imageUrl && (
                                    <div className={`mb-2 overflow-hidden rounded-lg border border-[hsl(var(--ide-border))] ${isMe ? 'bg-cyan-900/10' : 'bg-gray-800/20'}`}>
                                        <img src={imageUrl} alt="Attachment" className="max-w-full max-h-64 object-cover" />
                                    </div>
                                )}

                                {/* Text Content */}
                                {msg.content && (
                                    <div className={`relative px-5 py-3 text-sm border backdrop-blur-sm shadow-sm ${
                                        isMe 
                                        ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-50 rounded-2xl rounded-tr-sm' 
                                        : 'bg-gray-800/40 border-gray-700/50 text-gray-200 rounded-2xl rounded-tl-sm'
                                    }`}>
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                )}

                                {/* Metadata Row */}
                                <div className={`flex items-center gap-2 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <span className="text-[10px] text-gray-500 font-mono opacity-60 uppercase">
                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                    </span>
                                    
                                    {isMe && (
                                        <div className={`flex transition-colors ${msg.read ? 'text-cyan-400' : 'text-gray-500'} opacity-80`}>
                                            <CheckCheck size={14} />
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    );
                })}
                
                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex w-full justify-start animate-in fade-in duration-300">
                         <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                         </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[hsl(var(--ide-bg))]/90 backdrop-blur-md border-t border-[hsl(var(--ide-border))] z-20">
                {/* Image Preview */}
                {previewUrl && (
                    <div className="mb-3 flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-cyan-500/30 w-fit">
                        <div className="w-12 h-12 rounded overflow-hidden relative border border-gray-600">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-cyan-400 font-medium">Image selected</span>
                            <span className="text-[10px] text-gray-500">{selectedFile?.name}</span>
                        </div>
                        <button onClick={clearFile} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 bg-black/40 border border-gray-700/50 rounded-xl p-2 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileSelect}
                    />

                    {/* Attachments */}
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 transition-colors ${selectedFile ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'}`}
                    >
                        <Paperclip size={18} />
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Enter command or message..."
                        className="flex-1 bg-transparent border-none px-2 py-2 text-sm text-gray-200 focus:outline-none font-mono placeholder:text-gray-600"
                    />

                    {/* Emoji */}
                    <button type="button" className="p-2 text-gray-500 hover:text-yellow-400 transition-colors">
                        <Smile size={18} />
                    </button>

                    <button 
                        type="submit" 
                        disabled={sending || (!newMessage.trim() && !selectedFile)}
                        className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-900/20"
                    >
                        {sending ? <Clock size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
