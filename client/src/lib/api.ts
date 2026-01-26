import axios from 'axios';

export const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://localhost:5000';

export const API_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // change to true ONLY if backend uses cookies
});

// 🔐 Request interceptor (Next.js safe)
api.interceptors.request.use(
    (config) => {
        // ✅ Prevent SSR crash
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
