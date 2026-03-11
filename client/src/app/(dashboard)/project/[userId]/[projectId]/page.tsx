"use client";

import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ExternalLink, Calendar, User, Code2, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ImageModal from '@/components/shared/ImageModal';

export default function ProjectPage() {
    const params = useParams();
    const { userId, projectId } = params;
    const router = useRouter();
    const { user: currentUser } = useAuth();

    const [project, setProject] = useState<any>(null);
    const [author, setAuthor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${BASE_URL}${path}`;
    };

    useEffect(() => {
        if (userId && projectId) {
            const fetchProject = async () => {
                try {
                    const { data } = await api.get(`/users/${userId}/projects/${projectId}`);
                    setProject(data.project);
                    setAuthor(data.author);
                } catch (error) {
                    console.error('Failed to fetch project', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProject();
        }
    }, [userId, projectId]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await api.delete(`/users/profile/projects/${projectId}`);
            router.push('/projects');
        } catch (error) {
            console.error('Failed to delete project', error);
            alert('Failed to delete project');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-cyan-500 w-8 h-8" /></div>;
    if (!project) return <div className="p-8 text-center text-gray-500">Project not found</div>;

    // Check if current user is the project owner
    const isOwner = currentUser && author && currentUser._id === author._id;

    return (
        <div className="max-w-4xl mx-auto p-8 h-full overflow-y-auto">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> Back
            </button>

            <article className="animate-in fade-in duration-500">
                {/* Header */}
                <header className="mb-8 border-b border-gray-800 pb-8">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">{project.title}</h1>
                        <div className="flex gap-3">
                            {project.link && (
                                <a href={project.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                    <ExternalLink size={18} /> Visit Project
                                </a>
                            )}
                            {isOwner && (
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        {author && (
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-cyan-400" />
                                <span>by <span className="text-white font-medium">{author.displayName}</span></span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-green-400" />
                            <span>Created {project.createdAt ? new Date(project.createdAt).getFullYear() : new Date().getFullYear()}</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description - Now First */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="w-1 h-5 bg-cyan-500 rounded-full"></span>
                                About this Project
                            </h3>
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {project.description}
                            </p>
                        </div>

                        {/* Images - Now Second */}
                        {((project.images && project.images.length > 0) || project.image) && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                                    Project Gallery
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Handle new images array */}
                                    {project.images && project.images.length > 0 ? (
                                        project.images.map((img: string, idx: number) => (
                                            <div 
                                                key={idx} 
                                                className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl hover:scale-105 transition-transform cursor-pointer"
                                                onClick={() => setSelectedImage(getImageUrl(img))}
                                            >
                                                <img src={getImageUrl(img)} alt={`${project.title} - ${idx + 1}`} className="w-full h-auto object-cover" />
                                            </div>
                                        ))
                                    ) : (
                                        /* Backward compatibility with old 'image' field */
                                        project.image && (
                                            <div 
                                                className="md:col-span-2 rounded-xl overflow-hidden border border-gray-800 shadow-2xl cursor-pointer"
                                                onClick={() => setSelectedImage(getImageUrl(project.image))}
                                            >
                                                <img src={getImageUrl(project.image)} alt={project.title} className="w-full h-auto object-cover" />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Tech Stack */}
                        <div className="bg-[hsl(var(--ide-sidebar))] border border-[hsl(var(--ide-border))] p-5 rounded-xl">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Code2 size={16} /> Tech Stack
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tags?.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-cyan-900/20 text-cyan-300 border border-cyan-800/50 rounded-full text-sm">
                                        {tag}
                                    </span>
                                ))}
                                {!project.tags?.length && <p className="text-sm text-gray-500 italic">No tags listed</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {selectedImage && (
                <ImageModal
                    src={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
}
