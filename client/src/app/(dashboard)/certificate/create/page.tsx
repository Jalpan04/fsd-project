"use client";

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Award, Calendar, Link as LinkIcon, Building2 } from 'lucide-react';

export default function AddCertificatePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    // State
    const [name, setName] = useState('');
    const [issuer, setIssuer] = useState('');
    const [date, setDate] = useState('');
    const [link, setLink] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userRes = await api.get('/auth/me');
            const currentCerts = userRes.data.certificates || [];
            
            const newCert = { name, issuer, date, link };
            const updatedCerts = [...currentCerts, newCert];

            await api.put('/users/profile', { certificates: updatedCerts });

            router.push('/profile');
        } catch (error) {
            console.error('Failed to add certificate', error);
            alert('Failed to add certificate');
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
                        <Award className="text-yellow-500" /> Add Certification
                    </h1>
                    <p className="text-gray-400 mt-1">Add your professional certifications and achievements.</p>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Certificate Name *</label>
                        <div className="relative">
                            <Award className="absolute left-3 top-2.5 text-gray-500" size={18} />
                            <input 
                                type="text" 
                                required
                                className="w-full bg-black/30 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="e.g. AWS Certified Solutions Architect"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Issuing Organization *</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 text-gray-500" size={18} />
                            <input 
                                type="text" 
                                required
                                className="w-full bg-black/30 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="e.g. Amazon Web Services"
                                value={issuer}
                                onChange={(e) => setIssuer(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Issue Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input 
                                    type="date" 
                                    className="w-full bg-black/30 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors "
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Credential URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 text-gray-500" size={18} />
                                <input 
                                    type="url" 
                                    className="w-full bg-black/30 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="https://..."
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                />
                            </div>
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
                            Add Certificate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
