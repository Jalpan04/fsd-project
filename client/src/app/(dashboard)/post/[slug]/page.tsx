"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import PostCard from '@/components/feed/PostCard';

export default function SinglePostPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            const fetchPost = async () => {
                try {
                    const { data } = await api.get(`/posts/${slug}`);
                    setPost(data);
                } catch (error) {
                    console.error('Failed to fetch post', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [slug]);

    const handlePostDeleted = () => {
        router.push('/feed');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    if (!post) {
        return <div className="text-center py-20 text-gray-400">Post not found</div>;
    }

    return (
        <div className="max-w-[550px] mx-auto py-6 px-4">
            <button 
                onClick={() => router.back()} 
                className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
                ← Back
            </button>
            <PostCard post={post} onPostDeleted={handlePostDeleted} />
        </div>
    );
}
