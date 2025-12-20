"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

import { User } from '@/types/user';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('userInfo');

            if (!token) {
                setLoading(false);
                return;
            }

            if (storedUser) {
                 setUser(JSON.parse(storedUser));
            }

            try {
                // Verify token and get fresh data
                const { data } = await api.get('/auth/me');
                setUser(data);
                localStorage.setItem('userInfo', JSON.stringify(data));
            } catch (error) {
                console.error("Auth check failed", error);
                localStorage.removeItem('token');
                localStorage.removeItem('userId'); 
                localStorage.removeItem('userInfo');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userInfo');
        setUser(null);
        router.push('/login');
    };

    const refreshUser = () => {
         // Re-trigger the checkAuth effect by some means or just expose checkAuth
         // Since checkAuth is inside useEffect, we can't export it directly without refactoring.
         // A simple way is to force a re-fetch or expose a method.
         // Better: Let's extract the fetch logic.
         const token = localStorage.getItem('token');
         if(token) {
            api.get('/auth/me')
            .then(res => {
                setUser(res.data);
                localStorage.setItem('userInfo', JSON.stringify(res.data));
            })
            .catch(err => console.error(err));
         }
    };

    return { user, loading, logout, refreshUser };
}
