"use client";

import React, { useState, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Send } from 'lucide-react';
import ImageUpload from '@/components/shared/ImageUpload';

interface CreatePostWidgetProps {
    onPostCreated?: () => void;
}

export default function CreatePostWidget({ onPostCreated }: CreatePostWidgetProps) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(''); // URL string
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!content.trim() && !image) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                content,
                image: image // Now sending the actual uploaded path
            };

            await api.post('/posts', payload);
            
            setContent('');
            setImage('');
            setIsExpanded(false); 
            if (onPostCreated) {
                onPostCreated();
            }
        } catch (err: any) { 
            console.error('Create Post Failed:', err); 
            setError(err.response?.data?.message || err.message || 'Failed to create post'); 
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className={`bg-[hsl(var(--ide-sidebar))] border border-[hsl(var(--ide-border))] rounded-lg p-4 mb-6 transition-all duration-300 ${isExpanded ? 'shadow-lg shadow-black/40' : ''}`}>
            {error && (
                <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded">
                    {error}
                </div>
            )}

            <div className="flex gap-4">
                <img 
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}`} 
                    className="w-10 h-10 rounded-full border border-gray-700 mt-1"
                    alt={user.username}
                />
                
                <div className="flex-1">
                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                            <textarea
                                className={`w-full bg-black/20 border border-gray-700/50 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none ${isExpanded ? 'min-h-[100px]' : 'h-11 overflow-hidden py-2.5'}`}
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onFocus={() => setIsExpanded(true)}
                            />
                        </div>

                        {/* Image Upload Component - Only show when expanded */}
                        {isExpanded && (
                            <div className="mt-4">
                                <ImageUpload 
                                    value={image} 
                                    onChange={setImage} 
                                    placeholder="Add an image to your post"
                                />
                            </div>
                        )}

                        {/* Actions Bar - Only show when expanded */}
                        {isExpanded && (
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex gap-2">
                                    {/* Additional tools can go here */}
                                </div>

                                <div className="flex gap-2">
                                     <button 
                                        type="button"
                                        onClick={() => {
                                            setIsExpanded(false);
                                            setError('');
                                            setImage(''); // Optional: clear image on cancel or keep? User might want to keep. Let's clear for "Close" feel.
                                        }}
                                        className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading || (!content.trim() && !image)}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold py-1.5 px-5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={16} />}
                                        Post
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
