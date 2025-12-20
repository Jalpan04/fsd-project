"use client";

import React, { useState } from 'react';
import { Github, Code2, Terminal, Mail, Lock, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleGithubLogin = () => {
        setIsLoading(true);
        const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const endpoint = authMode === 'login' 
                ? '/auth/login'
                : '/auth/register';
            
            const response = await api.post(endpoint, formData);
            
            const { token, _id } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', _id);
            localStorage.setItem('userInfo', JSON.stringify(response.data));

            router.push('/profile');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--ide-bg))] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[hsl(var(--ide-sidebar))] border border-[hsl(var(--ide-border))] rounded-lg shadow-xl p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-cyan-600 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-cyan-900/20">
                        <Terminal className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">MainBranch</h1>
                    <p className="text-gray-400 text-center text-sm">
                        The Professional Identity for Developers
                    </p>
                </div>

                <div className="space-y-4">
                    {/* GitHub Button */}
                    <button
                        onClick={handleGithubLogin}
                        disabled={isLoading}
                        className="w-full bg-[#24292e] hover:bg-[#2f363d] text-white h-11 rounded-md flex items-center justify-center transition-all border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed group font-medium text-sm"
                    >
                        {isLoading && <Loader2 className="mr-2 animate-spin" size={16} />}
                        {!isLoading && <Github className="mr-3 group-hover:scale-110 transition-transform" size={18} />}
                        Continue with GitHub
                    </button>
                    
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[hsl(var(--ide-sidebar))] px-2 text-gray-500">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-3">
                        {error && (
                            <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-xs">
                                {error}
                            </div>
                        )}
                        
                        {authMode === 'register' && (
                             <div className="relative group">
                                <User className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Username" 
                                    className="w-full bg-black/20 border border-gray-700 rounded h-10 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                className="w-full bg-black/20 border border-gray-700 rounded h-10 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                className="w-full bg-black/20 border border-gray-700 rounded h-10 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-10 rounded-md font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="text-center text-xs text-gray-500 mt-4">
                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            onClick={() => {
                                setAuthMode(authMode === 'login' ? 'register' : 'login');
                                setError('');
                            }}
                            className="text-cyan-400 hover:text-cyan-300 underline"
                        >
                            {authMode === 'login' ? 'Register' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
