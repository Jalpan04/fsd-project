"use client";

import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from '@/lib/api';
import Link from 'next/link';
import { MessageSquare, ThumbsUp, Send, Globe, MoreHorizontal, Loader2, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface Post {
  _id: string;
  content: string;
  slug: string;
  author: {
    _id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
    headline?: string;
  };
  createdAt: string;
  tags: string[];
  likes: string[];
  commentsCount: number;
  image?: string; 
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  upvotes: string[];
  parentComment?: string;
  children?: Comment[];
}

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
}

export default function PostCard({ post: initialPost, onPostDeleted }: PostCardProps) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [commentTree, setCommentTree] = useState<Comment[]>([]);

  useEffect(() => {
    if (comments.length) {
      setCommentTree(buildCommentTree(comments));
    }
  }, [comments]);

  const buildCommentTree = (flatComments: Comment[]) => {
    const map: Record<string, Comment> = {};
    const roots: Comment[] = [];
    // Deep clone to avoid mutating state directly during re-renders if causing issues, 
    // but here we are building a new tree view. 
    // Warning: Mutating objects in 'map' that refer to 'flatComments' elements might be mutating state if 'flatComments' is state.
    // Better to map to new objects.
    const commentsCopy = flatComments.map(c => ({...c, children: []}));
    
    commentsCopy.forEach((c) => {
      map[c._id] = c;
    });
    
    commentsCopy.forEach((c) => {
      if (c.parentComment) {
        const parent = map[c.parentComment];
        if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(c);
        }
      } else {
        roots.push(c);
      }
    });
    return roots;
  };
  const renderComment = (comment: Comment, depth = 0) => {
    const isCommentLiked = user && comment.upvotes?.includes(user._id);
    const canDelete = user && comment.author && comment.author._id?.toString() === user._id.toString();
    return (
      <div key={comment._id} className="flex gap-2" style={{ marginLeft: depth * 20 }}>
        <img
          src={comment.author?.avatarUrl || `https://ui-avatars.com/api/?name=${comment.author?.username}`}
          className="w-8 h-8 rounded-full mt-1 border border-gray-700"
          alt="avatar"
        />
        <div className="flex-1">
          <div className="bg-gray-800/50 rounded-md p-2.5 inline-block min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-xs hover:underline cursor-pointer">
                {comment.author?.displayName || comment.author?.username}
              </span>
              <span className="text-[10px] text-gray-500 ml-2">
                {formatDistanceToNow(new Date(comment.createdAt))}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-snug break-words">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1 text-[11px] text-gray-500 font-medium">
            <button
              onClick={() => handleCommentVote(comment._id)}
              className={`hover:text-cyan-400 hover:underline transition-colors ${isCommentLiked ? 'text-cyan-500' : ''}`}
            >
              Like{comment.upvotes?.length > 0 && <span className="ml-1">{comment.upvotes.length}</span>}
            </button>
            <span>|</span>
            <button
              className="hover:text-cyan-400 hover:underline transition-colors"
              onClick={() => setReplyingTo(comment._id)}
            >
              Reply
            </button>
            {canDelete && (
              <button
                className="hover:text-red-400 hover:underline transition-colors"
                onClick={() => handleDeleteComment(comment._id, comment.parentComment)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          {replyingTo === comment._id && (
            <form onSubmit={handleReplySubmit} className="mt-2 flex items-center gap-2">
              <input
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-1 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button
                type="submit"
                className="text-cyan-500 hover:text-cyan-400 disabled:opacity-50"
                disabled={isSubmittingComment}
              >
                Send
              </button>
            </form>
          )}
          {comment.children && comment.children.length > 0 && (
            <div className="mt-2">
              {comment.children.map((child) => renderComment(child, depth + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleLike = async () => {
    if (!user) return;
    const isLiked = post.likes?.includes(user._id);
    const newLikes = isLiked ? post.likes.filter((id) => id !== user._id) : [...(post.likes || []), user._id];
    setPost({ ...post, likes: newLikes });
    try {
      await api.post(`/posts/${post._id}/like`, {});
    } catch (error) {
      console.error('Like failed', error);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setShowComments(true);
      if (comments.length === 0) {
        setCommentsLoading(true);
        try {
          const { data } = await api.get(`/posts/${post._id}/comments`);
          setComments(data);
        } catch (error) {
          console.error('Failed to fetch comments', error);
        } finally {
          setCommentsLoading(false);
        }
      }
    } else {
      setShowComments(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { content: newComment });
      setComments([data, ...comments]);
      setNewComment('');
      setPost({ ...post, commentsCount: (post.commentsCount || 0) + 1 });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim() || !replyingTo) return;
    setIsSubmittingComment(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { content: replyContent, parentComment: replyingTo });
      setComments([data, ...comments]);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Reply submit error:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentVote = async (commentId: string) => {
    if (!user) return;
    try {
      const { data } = await api.post(`/posts/comments/${commentId}/vote`, { type: 'upvote' });
      setComments(comments.map((c) => (c._id === commentId ? data : c)));
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeletePost = async () => {
    if (!user) return;
    try {
      await api.delete(`/posts/${post._id}`);
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (error) {
      console.error('Delete post error:', error);
    }
  };

  const handleDeleteComment = async (commentId: string, parentCommentId?: string) => {
    if (!user) return;
    
    const getDescendantIds = (parentId: string, allComments: Comment[]): string[] => {
      const children = allComments.filter(c => c.parentComment === parentId);
      let ids = children.map(c => c._id);
      children.forEach(child => {
        ids = [...ids, ...getDescendantIds(child._id, allComments)];
      });
      return ids;
    };

    try {
      await api.delete(`/posts/${post._id}/comments/${commentId}`);
      
      const idsToRemove = [commentId, ...getDescendantIds(commentId, comments)];
      const filtered = comments.filter((c) => !idsToRemove.includes(c._id));
      setComments(filtered);
      
      if (!parentCommentId) {
        setPost({ ...post, commentsCount: Math.max((post.commentsCount || 1) - 1, 0) });
      }
    } catch (error: any) {
      console.error('Delete comment error:', error);
      if (error.response && error.response.status === 404) {
         const idsToRemove = [commentId, ...getDescendantIds(commentId, comments)];
         const filtered = comments.filter((c) => !idsToRemove.includes(c._id));
         setComments(filtered);
      }
    }
  };

  const isLiked = user && post.likes?.includes(user._id);
  const canDeletePost = user && post.author && post.author._id?.toString() === user._id.toString();

  return (
    <article className="group bg-[hsl(var(--ide-bg))]/40 backdrop-blur-sm border border-[hsl(var(--ide-border))] rounded-lg overflow-hidden mb-4 hover:border-gray-600 transition-all duration-300 relative">
      
      {/* Tech Corner Accent */}
      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.1),transparent_70%)]" />
      </div>

      {/* Header */}
      <div className="p-4 flex gap-3 text-sm relative z-10">
        <Link href={`/profile/${post.author.username}`} className="relative">
             <div className="absolute -inset-0.5 rounded-full blur opacity-50 bg-gray-500/20 group-hover:bg-cyan-500/30 transition-colors" />
            <img
            src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.username}&background=0f172a&color=38bdf8`}
            alt={post.author.username}
            className="relative w-11 h-11 rounded-lg border border-gray-700/50 object-cover bg-black"
            />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="mr-6">
              <Link href={`/profile/${post.author.username}`} className="font-bold text-gray-200 tracking-wide hover:text-cyan-400 transition-colors cursor-pointer truncate block">
                {post.author.displayName || post.author.username}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.5 rounded-sm bg-gray-800/50 text-[10px] text-gray-400 font-mono border border-gray-700/50">
                    {post.author.headline || "Dev_Unit"}
                </span>
                <span className="text-[10px] text-gray-600 font-mono flex items-center gap-1">
                    <Clock size={10} />
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canDeletePost && (
                <button className="text-red-900/40 hover:text-red-500 transition-colors" onClick={handleDeletePost}>
                  <Trash2 size={16} />
                </button>
              )}
              <button className="text-gray-600 hover:text-gray-300 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.slug || post._id}`} className="block px-4 pb-3 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed hover:text-gray-200 transition-colors">
        {post.content}
      </Link>

      {post.image && (
        <div className="mt-2 mb-2 border-y border-[hsl(var(--ide-border))] bg-black/50">
            <img 
                src={`${BASE_URL}${post.image}`} 
                alt="Post content" 
                className="w-full h-auto object-cover max-h-[500px]"
            />
        </div>
      )}

      {/* Stats Bar */}
      <div className="px-4 py-2 border-t border-[hsl(var(--ide-border))] bg-black/10 flex items-center justify-between text-[11px] text-gray-500 font-mono uppercase tracking-wider">
          <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                  <ThumbsUp size={12} className={post.likes?.length ? "text-cyan-500" : ""} /> {post.likes?.length || 0} Synchs
              </span>
              <span className="flex items-center gap-1">
                  <MessageSquare size={12} /> {post.commentsCount || 0} Packets
              </span>
          </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-px bg-[hsl(var(--ide-border))] border-t border-[hsl(var(--ide-border))]">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-2 py-3 bg-[hsl(var(--ide-bg))] hover:bg-white/5 transition-colors ${isLiked ? 'text-cyan-400' : 'text-gray-400'}`}
        >
          <ThumbsUp size={16} className={isLiked ? "fill-current" : ""} />
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center justify-center gap-2 py-3 bg-[hsl(var(--ide-bg))] hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
        >
          <MessageSquare size={16} />
        </button>
        <button className="flex items-center justify-center gap-2 py-3 bg-[hsl(var(--ide-bg))] hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
          <Send size={16} />
        </button>
        <button className="flex items-center justify-center gap-2 py-3 bg-[hsl(var(--ide-bg))] hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
            <Globe size={16} />
        </button>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="bg-black/20 p-4 border-t border-[hsl(var(--ide-border))] animate-in slide-in-from-top-2 duration-200">
          {user && (
            <div className="flex items-start gap-3 mb-6">
              <img
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}`}
                className="w-8 h-8 rounded-lg border border-gray-700 bg-black"
                alt="Me"
              />
              <div className="flex-1">
                <form onSubmit={handleCommentSubmit} className="relative group/input">
                  <input
                    className="w-full bg-[hsl(var(--ide-bg))] border border-gray-700 rounded-md py-2 pl-3 pr-10 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                    placeholder="Input data packet..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    autoFocus
                  />
                  {newComment.trim() && (
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-400 disabled:opacity-50"
                      disabled={isSubmittingComment}
                    >
                      <Send size={14} />
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}

          {commentsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-cyan-500" size={20} />
            </div>
          ) : (
            <div className="space-y-4">
              {commentTree.map((c) => renderComment(c))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
