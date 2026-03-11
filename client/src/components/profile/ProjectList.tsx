import React from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, ExternalLink, Plus, FolderOpen } from 'lucide-react';
import { BASE_URL } from '@/lib/api';

interface ProjectListProps {
    projects: any[];
    isOwner: boolean;
    userId: string;
}

export default function ProjectList({ projects, isOwner, userId }: ProjectListProps) {
    const router = useRouter();

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('https://res.cloudinary.com')) return path;
        return `${BASE_URL}${path}`;
    };

    return (
        <div className="w-full">
            {isOwner && (
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => router.push('/project/create')}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-cyan-900/20 transition-all hover:scale-105"
                    >
                        <Plus size={20} /> Add Project
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects && projects.length > 0 ? (
                    projects.map((proj: any, idx: number) => {
                        // Handle both new 'images' array and old 'image' field
                        const displayImage = (proj.images && proj.images.length > 0)
                            ? proj.images[0]
                            : proj.image;

                        return (
                            <div
                                key={idx}
                                onClick={() => router.push(`/project/${userId}/${proj._id}`)}
                                className="group relative bg-[hsl(var(--ide-sidebar))] border border-[hsl(var(--ide-border))] rounded-xl overflow-hidden hover:border-cyan-500/50 hover:shadow-2xl transition-all cursor-pointer h-full flex flex-col"
                            >
                                <div className="h-32 bg-gradient-to-br from-gray-800 to-black relative">
                                    {displayImage ? (
                                        <img src={getImageUrl(displayImage)} alt={proj.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-700">
                                            <Briefcase size={32} opacity={0.2} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-2 bg-black/60 backdrop-blur rounded-lg text-white hover:bg-cyan-600 transition-colors">
                                            <ExternalLink size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-white text-lg mb-2 group-hover:text-cyan-400 transition-colors">{proj.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                                        {proj.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {proj.tags?.map((tag: string) => (
                                            <span key={tag} className="text-[11px] font-medium bg-cyan-900/10 text-cyan-300 px-2 py-1 rounded border border-cyan-800/20">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-[hsl(var(--ide-border))] rounded-xl bg-[hsl(var(--ide-sidebar))]/30">
                        {isOwner ? (
                            <>
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Briefcase size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                                <p className="text-gray-400 max-w-md mx-auto mb-6">
                                    Start building your portfolio by adding your first project.
                                </p>
                                <button
                                    onClick={() => router.push('/project/create')}
                                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors font-medium border border-white/10"
                                >
                                    Create Project
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                    <FolderOpen size={32} className="text-gray-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No public projects</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    This developer hasn't showcased any projects yet.
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
