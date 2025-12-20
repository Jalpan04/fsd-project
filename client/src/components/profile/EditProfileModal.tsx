"use client";

import React, { useState } from 'react';
import api from '@/lib/api';
import { X, Loader2, Plus, X as XIcon } from 'lucide-react';

interface EditProfileModalProps {
    user: any;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditProfileModal({ user, onClose, onUpdate }: EditProfileModalProps) {
    const [bio, setBio] = useState(user.bio || '');
    const [displayName, setDisplayName] = useState(user.displayName || user.username || '');
    const [leetcodeUsername, setLeetcodeUsername] = useState(user.stats?.leetcode?.username || '');
    const [kaggleUsername, setKaggleUsername] = useState(user.stats?.kaggle?.username || '');
    const [huggingfaceUsername, setHuggingfaceUsername] = useState(user.stats?.huggingface?.username || '');
    const [blogUrl, setBlogUrl] = useState(user.socials?.blog || '');
    
    const [skills, setSkills] = useState<string[]>(user.skills || []);
    const [newSkill, setNewSkill] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload: any = {
                bio,
                displayName,
                leetcodeUsername,
                kaggleUsername,
                huggingfaceUsername,
                blogUrl,
                skills
            };

            await api.put('/users/profile', payload);

            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                <header className="flex justify-between items-center p-4 border-b border-border bg-secondary/30">
                    <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X size={20} />
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Display Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-input/50 border border-input rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Bio</label>
                        <textarea 
                            className="w-full bg-input/50 border border-input rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[100px]"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    {/* Integrated Platforms */}
                    <div className="pt-4 border-t border-border">
                        <label className="block text-xs font-bold text-primary mb-3 uppercase tracking-wider">Integrations</label>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">LeetCode Username</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-input/50 border border-input rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                    value={leetcodeUsername}
                                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                                    placeholder="username"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Kaggle Username</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-input/50 border border-input rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                    value={kaggleUsername}
                                    onChange={(e) => setKaggleUsername(e.target.value)}
                                    placeholder="username"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Hugging Face Username</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-input/50 border border-input rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                    value={huggingfaceUsername}
                                    onChange={(e) => setHuggingfaceUsername(e.target.value)}
                                    placeholder="username"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Personal Blog URL</label>
                                <input 
                                    type="url" 
                                    className="w-full bg-input/50 border border-input rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                    value={blogUrl}
                                    onChange={(e) => setBlogUrl(e.target.value)}
                                    placeholder="https://yourblog.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                         <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Skills</label>
                         <div className="flex gap-2 mb-3">
                             <input 
                                type="text"
                                className="flex-1 bg-input/50 border border-input rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-all"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add a skill (e.g. React)"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                             />
                             <button 
                                type="button"
                                onClick={handleAddSkill}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded transition-colors"
                             >
                                 <Plus size={18} />
                             </button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                             {skills.map(skill => (
                                 <span key={skill} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-sm border border-border group">
                                     {skill}
                                     <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-muted-foreground hover:text-destructive ml-1 transition-colors">
                                         <XIcon size={14} />
                                     </button>
                                 </span>
                             ))}
                         </div>
                    </div>
                </form>
                
                <div className="p-4 border-t border-border flex justify-end gap-3 bg-secondary/10">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md font-medium text-sm flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all"
                    >
                        {isLoading && <Loader2 className="animate-spin" size={16} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
