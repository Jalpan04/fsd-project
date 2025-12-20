"use client";

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Link as LinkIcon, Code2, Type } from 'lucide-react';
import ImageUpload from '@/components/shared/ImageUpload';

export default function AddProjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    // State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [tags, setTags] = useState('');
    const [image, setImage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const newProject = {
                title,
                description,
                link,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                image: image || null
            };

            await api.post('/users/profile/projects', newProject);

            router.push('/profile');
        } catch (error) {
            console.error('Failed to add project', error);
            alert('Failed to add project');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 h-full overflow-y-auto">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> Back
            </button>

            <div className="bg-[hsl(var(--ide-sidebar))] border border-[hsl(var(--ide-border))] rounded-lg shadow-xl overflow-hidden">
                <header className="p-6 border-b border-[hsl(var(--ide-border))]">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Code2 className="text-cyan-500" /> Add New Project
                    </h1>
                    <p className="text-gray-400 mt-1">Showcase your best work to the community.</p>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Project Title *</label>
                        <div className="relative">
                            <Type className="absolute left-3 top-2.5 text-gray-500" size={18} />
                            <input 
                                type="text" 
                                required
                                className="w-full bg-black/30 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="e.g. AI Content Generator"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-300 mb-2">Project Cover Image</label>
                         <ImageUpload value={image} onChange={setImage} placeholder="Upload Project Cover" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                        <textarea 
                            required
                            className="w-full bg-black/30 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors min-h-[120px]"
                            placeholder="Describe what your project does, the tech stack used, and any challenges you overcame..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Project Link</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input 
                                    type="url" 
                                    className="w-full bg-black/30 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="https://github.com/..."
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Technologies</label>
                            <div className="relative">
                                <Code2 className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input 
                                    type="text" 
                                    className="w-full bg-black/30 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="React, Node.js, Python..."
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Comma separated</p>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-[hsl(var(--ide-border))]">
                        <button 
                            type="button" 
                            onClick={() => router.back()}
                            className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-cyan-900/20"
                        >
                            {isLoading && <Loader2 className="animate-spin" size={18} />}
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
