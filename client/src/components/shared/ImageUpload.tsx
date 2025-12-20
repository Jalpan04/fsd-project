"use client";

import React, { useState, useRef } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import api from '@/lib/api';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    placeholder?: string;
    className?: string;
}

export default function ImageUpload({ value, onChange, placeholder = "Upload Image", className = "" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Assuming the server returns { filePath: "/uploads/filename.ext" }
            // We need to prepend the server URL if it's returning a relative path, 
            // BUT api.ts is for axios base URL. 
            // For displaying images, we likely need the full URL or a relative one if we use an img tag pointing to the API domain.
            // Let's assume we store the relative path and the consumer (img tag) needs to know the base URL.
            // actually, simpler: let's store the full URL if possible, or just the relative path 
            // and have a utility to construct it.
            // For now, let's just use the relative path returned by server, which matches the static serve.
            // The server is at localhost:5000 (or env).
            // NOTE: We need to ensure we can display this image. 
            // If we save "/uploads/file.png", <img src="/uploads/..." /> will try to fetch from client:3000/uploads
            // We need it to be http://localhost:5000/uploads.
            // So we should construct the full URL here or in the backend. 
            // Let's append the BASE_URL from configuration if needed, but we don't have it easily exposed as string without logic.
            // Actually, let's just make the backend return the full URL if possible, or we prepend a known constant.
            
            // For this iteration, let's return the relative path and let the component handle it, 
            // or even better, let's prepend the API_URL here if we can import it.
            // We can import API_URL from '@/lib/api'.
            
            // Wait, api.ts exports BASE_URL which is /api. We need the root.
            // Let's assume the server returns a path we can use. 
            // Let's try to just return what the server gave us for now.
            onChange(data.filePath); 
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Helper to verify if we need to prepend domain
    // If value starts with http, use it. If /uploads, prepend http://localhost:5000 (or whatever)
    // Actually, this logic is best kept in a utility or just hardcoded for this MVP debt fix.
    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        // Fallback for local dev
        return `http://localhost:5000${path}`; 
    };

    return (
        <div className={`relative ${className}`}>
             {value ? (
                <div className="relative w-full h-48 bg-black/40 rounded-lg overflow-hidden border border-gray-700">
                    <img 
                        src={getImageUrl(value)} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                        type="button"
                    >
                        <X size={16} className="text-white" />
                    </button>
                </div>
            ) : (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-700 hover:border-cyan-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-black/20 hover:bg-black/40 group"
                >
                    {uploading ? (
                        <Loader2 className="animate-spin text-cyan-500" size={24} />
                    ) : (
                        <>
                            <Upload className="text-gray-400 group-hover:text-cyan-500 mb-2 transition-colors" size={24} />
                            <span className="text-gray-400 group-hover:text-cyan-500 text-sm font-medium transition-colors">
                                {placeholder}
                            </span>
                        </>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            )}
        </div>
    );
}
