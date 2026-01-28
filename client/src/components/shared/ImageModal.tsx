"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
    src: string;
    alt?: string;
    onClose: () => void;
}

export default function ImageModal({ src, alt = "Expanded view", onClose }: ImageModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!src) return null;

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors z-50"
            >
                <X size={24} />
            </button>
            <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
