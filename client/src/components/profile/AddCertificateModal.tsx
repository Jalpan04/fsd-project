"use client";
import React, { useState } from 'react';
import { X, Award } from 'lucide-react';
import DatePicker from '../shared/DatePicker';

interface AddCertificateModalProps {
    onClose: () => void;
    onSave: (cert: any) => void;
}

export default function AddCertificateModal({ onClose, onSave }: AddCertificateModalProps) {
    const [name, setName] = useState('');
    const [issuer, setIssuer] = useState('');
    const [date, setDate] = useState('');
    const [link, setLink] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            issuer,
            date,
            link
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[hsl(var(--ide-sidebar))] border border-[hsl(var(--ide-border))] rounded-lg w-full max-w-md shadow-2xl">
                <header className="flex justify-between items-center p-4 border-b border-[hsl(var(--ide-border))]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Award size={20} className="text-yellow-500" /> Add Certificate
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Certificate Name</label>
                        <input 
                            type="text" required
                            className="w-full bg-black/30 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            value={name} onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Issuing Organization</label>
                         <input 
                            type="text" required
                            className="w-full bg-black/30 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            value={issuer} onChange={(e) => setIssuer(e.target.value)}
                         />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Date Issued</label>
                        <DatePicker 
                            value={date} 
                            onChange={setDate} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Credential URL</label>
                        <input 
                            type="url"
                            className="w-full bg-black/30 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="https://..."
                            value={link} onChange={(e) => setLink(e.target.value)}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded font-medium">Add Certificate</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
