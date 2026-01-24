
"use client";

import React, { useEffect, useState } from 'react';
import UserListModal from '@/components/profile/UserListModal';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

export default function GitHubModalContainer() {
    const { user } = useAuth();
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleOpenFollowers = () => {
            setShowFollowers(true);
            fetchFollowers();
        };

        const handleOpenFollowing = () => {
            setShowFollowing(true);
            fetchFollowing();
        };

        window.addEventListener('open-github-followers', handleOpenFollowers);
        window.addEventListener('open-github-following', handleOpenFollowing);

        return () => {
            window.removeEventListener('open-github-followers', handleOpenFollowers);
            window.removeEventListener('open-github-following', handleOpenFollowing);
        };
    }, [user]);

    const fetchFollowers = async () => {
        // We can fetch from public GitHub API if we have a username
        // Or better, use our backend if we want to use the stored accessToken
        // For now, let's try public API since it's easiest for a prototype
        // If user object has a username, we use that.
        // NOTE: Without a token, limit is 60/hr.

        // Find GitHub username
        const githubUsername = user?.stats?.github?.username || user?.username;
        if (!githubUsername) return;

        setLoading(true);
        try {
            // Ideally should proxy this through our backend to use the accessToken safely
            // But 'posts/following' or similar might exist.
            // Let's just hit public API for now.
            const res = await axios.get(`https://api.github.com/users/${githubUsername}/followers`);

            // Map to UserListModal format
            const mapped = res.data.map((u: any) => ({
                _id: u.id,
                username: u.login,
                displayName: u.login, // GitHub API list doesn't give display name
                avatarUrl: u.avatar_url,
                headline: "GitHub User"
            }));
            setFollowers(mapped);
        } catch (error) {
            console.error("Failed to fetch GitHub followers", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowing = async () => {
        const githubUsername = user?.stats?.github?.username || user?.username;
        if (!githubUsername) return;

        setLoading(true);
        try {
            const res = await axios.get(`https://api.github.com/users/${githubUsername}/following`);

            // Map to UserListModal format
            const mapped = res.data.map((u: any) => ({
                _id: u.id,
                username: u.login,
                displayName: u.login,
                avatarUrl: u.avatar_url,
                headline: "GitHub User"
            }));
            setFollowing(mapped);
        } catch (error) {
            console.error("Failed to fetch GitHub following", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <UserListModal
                isOpen={showFollowers}
                onClose={() => setShowFollowers(false)}
                title="GitHub Followers"
                users={followers}
            />
            <UserListModal
                isOpen={showFollowing}
                onClose={() => setShowFollowing(false)}
                title="GitHub Following"
                users={following}
            />
        </>
    );
}
