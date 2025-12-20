"use client";

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const processedRef = React.useRef(false);

    useEffect(() => {
        if (code && !processedRef.current) {
            processedRef.current = true;
            const loginWithGithub = async () => {
                try {
                    // Call our Express Backend
                    const response = await api.post('/auth/github', { code });
                    
                    const { token, _id } = response.data;
                    
                    // Save to localStorage
                    localStorage.setItem('token', token);
                    localStorage.setItem('userId', _id);
                    localStorage.setItem('userInfo', JSON.stringify(response.data));

                    // Redirect to profile
                    router.push('/profile');
                } catch (error) {
                    console.error('Login failed', error);
                    // processedRef.current = false; // Optional: allow retry? No, code is one-time use.
                    router.push('/login?error=auth_failed');
                }
            };
            loginWithGithub();
        } else if (!code) {
             router.push('/login?error=no_code_provided');
        }
    }, [code, router]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[hsl(var(--ide-bg))] text-white">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
            <h2 className="text-xl font-mono">Authenticating...</h2>
            <p className="text-gray-500 mt-2">Connecting to GitHub</p>
        </div>
    );
}
