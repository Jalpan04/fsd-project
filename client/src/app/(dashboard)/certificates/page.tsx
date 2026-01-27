"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Award, Plus, Calendar, Building2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CertificatesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [localCerts, setLocalCerts] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.certificates) {
            setLocalCerts(user.certificates);
        }
    }, [loading, user, router]);

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500 w-8 h-8" /></div>;
    if (!user) return null;

    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
            <header className="flex justify-between items-center mb-8 pb-6 border-b border-[hsl(var(--ide-border))]">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Award className="text-yellow-500" /> My Certifications
                    </h1>
                    <p className="text-gray-400 mt-2">Credential wallet and achievements.</p>
                </div>
                <button
                    onClick={() => router.push('/certificate/create')}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-yellow-900/20 transition-all hover:scale-105"
                >
                    <Plus size={20} /> Add Certificate
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localCerts.length > 0 ? (
                    localCerts.map((cert: any, idx: number) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 bg-[hsl(var(--ide-sidebar))] border border-[hsl(var(--ide-border))] rounded-xl hover:border-yellow-500/30 transition-all group">
                            <div className="w-16 h-16 shrink-0 bg-yellow-900/20 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-900/50 group-hover:scale-110 transition-transform">
                                <Award size={32} />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-bold text-white text-lg mb-1">{cert.name}</h3>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-400 mb-3">
                                    <span className="flex items-center justify-center sm:justify-start gap-1.5"><Building2 size={14} /> {cert.issuer}</span>
                                    <span className="flex items-center justify-center sm:justify-start gap-1.5"><Calendar size={14} /> {cert.date ? new Date(cert.date).toLocaleDateString() : 'No Date'}</span>
                                </div>
                                {cert.link && (
                                    <a
                                        href={cert.link.startsWith('http') ? cert.link : `https://${cert.link}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md border border-gray-700 transition-colors"
                                    >
                                        View Credential <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-[hsl(var(--ide-border))] rounded-xl bg-[hsl(var(--ide-sidebar))]/30">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Award size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No certificates found</h3>
                        <p className="text-gray-400 max-w-md mx-auto mb-6">Showcase your professional achievements.</p>
                        <button
                            onClick={() => router.push('/certificate/create')}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors font-medium border border-white/10"
                        >
                            Add Certificate
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
