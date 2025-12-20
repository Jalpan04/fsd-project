"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ExternalLink, Calendar, User, Code2 } from 'lucide-react';

export default function ProjectPage() {
    const params = useParams(); // [userId, projectId] ideally, but simple route is [id]
    // Wait, I planned /project/[id] but I need userId too unless I search.
    // Let's use /project/[userId]/[projectId] for simplicity in routing OR
    // Just /project/[projectId] but backend needs to search?
    // Current backend implementation: /api/users/:userId/projects/:projectId
    // So on frontend, I should probably use a dynamic route like /project/[userId]/[projectId]/page.tsx
    // OR just pass userId in query param? URL structure is cleaner as /project/[id]?userId=...
    // Let's stick to /project/[id] and I'll find a way or change route.
    
    // Actually, simply putting the projectId in the URL is user friendly.
    // If I only have projectId, backend search is expensive (scan all users).
    // Let's use: /project/[userId]/[projectId]
    // Frontend structure: client/src/app/(dashboard)/project/[userId]/[projectId]/page.tsx
    
    // But wait, the previous `ProfilePage` linked to what?
    // I haven't updated ProfilePage links yet. 
    // I will assume the route is /project/[userId]/[projectId]
    
    const { userId, projectId } = params;
    const router = useRouter();
    
    const [project, setProject] = useState<any>(null);
    const [author, setAuthor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-cyan-500" /></div>;
    if (!project) return <div className="p-8 text-center text-gray-500">Project not found</div>;

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
                        {project.link && (
                            <a href={project.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                <ExternalLink size={18} /> Visit Project
                            </a>
                        )}
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
                        {/* Image */}
                        {project.image ? (
                             <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                                <img src={project.image} alt={project.title} className="w-full h-auto object-cover" />
                             </div>
                        ) : (
                             <div className="h-64 bg-gray-900/50 rounded-xl flex items-center justify-center border border-gray-800 border-dashed">
                                 <p className="text-gray-600 italic">No cover image provided</p>
                             </div>
                        )}

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">About this Project</h3>
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {project.description}
                            </p>
                        </div>
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
        </div>
    );
}
