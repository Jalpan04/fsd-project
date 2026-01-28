import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import ImageModal from '../shared/ImageModal';
import { Send, ArrowLeft, MoreVertical, Paperclip, Smile, Check, CheckCheck, Clock, X, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import PostCard from '@/components/feed/PostCard';

interface ChatWindowProps {
    recipient: any;
    onBack: () => void;
    onMessageSent?: (message: Message) => void;
}

interface Message {
    _id: string;
    sender: string; // ID
    content: string;
    image?: string;
    sharedPost?: any; // Populated post object
    createdAt: string;
    read?: boolean;
}

export default function ChatWindow({ recipient, onBack, onMessageSent }: ChatWindowProps) {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial scroll to bottom
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Keep track of if we should auto-scroll (i.e. if we are already at bottom)
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        // Check if we are near bottom (within 50px)
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldAutoScroll(isNearBottom);
    };

    const markMessagesAsRead = async () => {
        if (!user || !recipient) return;
        try {
            await api.put(`/chat/${recipient._id}/read`, {});
        } catch (error) {
            console.error("Mark read failed", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setMessageInput(prev => `${prev} [Image Selected] `);
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
                // Force scroll on initial load
                setTimeout(() => scrollToBottom("auto"), 100);
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };
        fetchMessages();
    }, [recipient, user]);

    // Auto-scroll effect
    useEffect(() => {
        if (shouldAutoScroll) {
            scrollToBottom();
        }
    }, [messages, shouldAutoScroll]); // Only scroll if we were already at bottom

    // Force scroll when typing starts/stops if near bottom? Maybe not needed.
    // Force scroll when previewing image
    useEffect(() => {
        if (previewUrl) scrollToBottom();
    }, [previewUrl]);

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
        setMessageInput(e.target.value);

        if (!socket || !recipient) return;

        // Emit typing event
        socket.emit('typing', { recipientId: recipient._id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { recipientId: recipient._id });
        }, 2000);
    };

    const onEmojiClick = (emojiObject: any) => {
        setMessageInput(prev => prev + emojiObject.emoji);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((!messageInput.trim() && !selectedFile) || !user) return;

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket?.emit('stop_typing', { recipientId: recipient._id });

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('recipientId', recipient._id);
            if (messageInput.trim()) formData.append('content', messageInput);
            if (selectedFile) formData.append('image', selectedFile);

            const { data } = await api.post('/chat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessages((prev) => [...prev, data]);
            setMessageInput('');
            clearFile();
            if (onMessageSent) onMessageSent(data);
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
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 flex flex-col relative z-10 w-full"
            >
                <div className="mt-auto flex flex-col justify-end"> {/* Use mt-auto to push content to bottom */}

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
                        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

                        // Grouping Logic - Previous (for top margin and timestamp)
                        const prevMsg = messages[index - 1];
                        const isSameSenderAsPrev = prevMsg && prevMsg.sender === msg.sender;
                        const timeDiffPrev = prevMsg ? new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() : Infinity;
                        const isSequence = isSameSenderAsPrev && timeDiffPrev < 5 * 60 * 1000; // 5 minutes

                        // Grouping Logic - Next (for ticks)
                        const nextMsg = messages[index + 1];
                        const isSameSenderAsNext = nextMsg && nextMsg.sender === msg.sender;
                        const timeDiffNext = nextMsg ? new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime() : Infinity;
                        const isLastInSequence = !isSameSenderAsNext || timeDiffNext >= 5 * 60 * 1000;

                        // Date grouping
                        const isNewDay = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

                        let dateLabel = '';
                        if (isNewDay) {
                            const date = new Date(msg.createdAt);
                            if (isToday(date)) dateLabel = 'Today';
                            else if (isYesterday(date)) dateLabel = 'Yesterday';
                            else dateLabel = format(date, 'MMMM d, yyyy');
                        }

                        return (
                            <div key={msg._id} className="w-full">
                                {isNewDay && (
                                    <div className="flex justify-center my-6">
                                        <span className="text-[11px] font-mono text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
                                            {dateLabel}
                                        </span>
                                    </div>
                                )}

                                <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 fade-in duration-300 ${isSequence ? 'mt-1' : 'mt-6'}`}>
                                    <div className={`max-w-[75%] relative ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>

                                        {msg.image && (
                                            <div className="mb-2 cursor-pointer" onClick={() => setExpandedImage(`${BASE_URL}${msg.image}`)}>
                                                <img src={`${BASE_URL}${msg.image}`} alt="Attachment" className="rounded-lg max-w-full h-auto" />
                                            </div>
                                        )}

                                        {msg.sharedPost && (
                                            <div className="mb-2 w-[400px] max-w-full border border-gray-700/50 rounded-lg overflow-hidden">
                                                <PostCard post={msg.sharedPost} />
                                            </div>
                                        )}

                                        {msg.content && (
                                            <div className={`relative px-5 py-3 text-sm border backdrop-blur-sm shadow-sm ${isMe
                                                ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-50 rounded-2xl rounded-tr-sm'
                                                : 'bg-gray-800/40 border-gray-700/50 text-gray-200 rounded-2xl rounded-tl-sm'
                                                } transition-all hover:scale-[1.01]`}>
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        )}

                                        {/* Metadata Row */}
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMe ? 'text-cyan-200/60' : 'text-gray-400'} min-h-[5px]`}>
                                            {!isSequence && (
                                                <span className="font-mono opacity-60 uppercase mb-1 block">
                                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                </span>
                                            )}

                                            {isMe && isLastInSequence && (
                                                <div className={`flex transition-colors ${msg.read ? 'text-cyan-400' : 'text-gray-500'} opacity-80 ml-auto`}>
                                                    <CheckCheck size={14} />
                                                </div>
                                            )}
                                        </div>

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

                    <div ref={messagesEndRef} className="h-4" /> {/* Spacer at bottom */}
                </div> {/* End Wrapper */}
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

                    {/* Emoji Picker Popup */}
                    {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2 z-50 shadow-xl border border-gray-700 rounded-xl overflow-hidden">
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme={'dark' as any}
                                width={300}
                                height={400}
                            />
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
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
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500 text-sm font-mono"
                    />

                    {/* Emoji */}
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2 hover:bg-white/10 rounded-full transition-colors ${showEmojiPicker ? 'text-cyan-400' : 'text-gray-400'}`}
                    >
                        <Smile size={20} />
                    </button>

                    <button
                        type="submit"
                        disabled={sending || (!messageInput.trim() && !selectedFile)}
                        className="p-2 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? <Clock size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </form>
            </div>
            {/* Image Modal */}
            {expandedImage && (
                <ImageModal
                    src={expandedImage}
                    onClose={() => setExpandedImage(null)}
                />
            )}
        </div>
    );
}
