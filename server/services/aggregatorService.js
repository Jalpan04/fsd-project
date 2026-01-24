const axios = require('axios');
const UnifiedEvent = require('../models/UnifiedEvent');
const User = require('../models/User');

const calculateScore = (type) => {
    switch (type) {
        case 'PushEvent': return 1; // 1 point per commit pushed? Actually event is one push. 
        case 'PullRequestEvent': return 2;
        case 'IssuesEvent': return 1;
        case 'IssueCommentEvent': return 1;
        case 'CreateEvent': return 1;
        default: return 0.5;
    }
};

const syncGitHub = async (user) => {
    // Ensure integration objects exist to avoid undefined errors
    if (!user.integrations) user.integrations = {};
    if (!user.integrations.github) user.integrations.github = {};
    const username = user.integrations.github.username;
    const accessToken = user.integrations.github.accessToken;

    if (!username) throw new Error('GitHub username not linked');

    console.log(`[Sync] Starting GitHub sync for ${username}...`);

    try {
        // Only use token if it's a valid format (starts with 'ghp_' or 'github_pat_' for new tokens, or is 40 chars hex for classic)
        const isValidToken = accessToken && (
            accessToken.startsWith('ghp_') ||
            accessToken.startsWith('github_pat_') ||
            /^[a-f0-9]{40}$/i.test(accessToken)
        );
        const headers = isValidToken ? { Authorization: `Bearer ${accessToken}` } : {};

        // 1. Fetch User Profile Stats (Followers, Repos, Stars)
        const profileRes = await axios.get(`https://api.github.com/users/${username}`, { headers });
        const { followers, following, public_repos } = profileRes.data;

        // Fetch Repos for Stars/Languages (Page 1 only for MVP)
        const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
        const total_stars = reposRes.data.reduce((acc, repo) => acc + repo.stargazers_count, 0);

        // Calculate Languages
        const languages = {};
        reposRes.data.forEach(repo => {
            if (repo.language) languages[repo.language] = (languages[repo.language] || 0) + 1;
        });

        // Update User Integration Stats
        user.integrations.github.stats = {
            followers,
            following,
            public_repos,
            total_stars,
            languages
        };
        user.integrations.github.lastSync = new Date();

        // 2. Fetch Activity Events (Last 90 days / 300 events limit by GitHub API)
        const eventsRes = await axios.get(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers });

        let newEventsCount = 0;
        for (const event of eventsRes.data) {
            try {
                // Check if already exists - convert ID to string
                const exists = await UnifiedEvent.exists({ externalId: String(event.id) });
                if (exists) continue;

                const score = calculateScore(event.type);

                // Safe Description Extraction
                let description = null;
                if (event.type === 'PushEvent' && event.payload.commits && event.payload.commits.length > 0) {
                    description = event.payload.commits[0].message;
                } else if (event.type === 'PullRequestEvent') {
                    description = event.payload.pull_request?.title;
                } else if (event.type === 'IssueCommentEvent') {
                    description = event.payload.comment?.body?.substring(0, 100);
                }

                const unifiedEvent = new UnifiedEvent({
                    user: user._id,
                    platform: 'github',
                    eventType: event.type,
                    externalId: String(event.id), // Convert to string
                    timestamp: new Date(event.created_at),
                    score: score,
                    title: `${event.type} in ${event.repo?.name || 'unknown repo'}`,
                    url: event.repo ? `https://github.com/${event.repo.name}` : 'https://github.com',
                    thumbnail: event.actor?.avatar_url,
                    description: description,
                    payload: event.payload
                });

                await unifiedEvent.save();
                newEventsCount++;
            } catch (innerError) {
                console.warn(`[Sync] Skipping generic event ${event.id}:`, innerError.message);
                continue; // Skip bad event, keep syncing
            }
        }

        await user.save();
        console.log(`[Sync] GitHub Sync Complete. ${newEventsCount} new events.`);
        return { success: true, newEvents: newEventsCount };

    } catch (error) {
        const msg = error.response?.data?.message || error.message;
        console.error('GitHub Sync Error:', msg);
        throw new Error(`GitHub API Error: ${msg}`);
    }
};

const syncLeetCode = async (user) => {
    const username = user.integrations?.leetcode?.username;
    if (!username) throw new Error('LeetCode username not linked');

    console.log(`[Sync] Starting LeetCode sync for ${username}...`);

    try {
        const query = `
            query getUserProfile($username: String!) {
                allQuestionsCount { difficulty count }
                matchedUser(username: $username) {
                    username
                    submitStats: submitStatsGlobal {
                        acSubmissionNum { difficulty count }
                    }
                    profile { ranking }
                }
            }
        `;

        const response = await axios.post('https://leetcode.com/graphql', {
            query,
            variables: { username }
        });

        const data = response.data?.data;
        if (!data || !data.matchedUser) throw new Error('LeetCode user not found');

        const matchedUser = data.matchedUser;
        const submitStats = matchedUser.submitStats.acSubmissionNum;
        const allQuestions = data.allQuestionsCount;

        // Solved
        const totalSolved = submitStats.find(s => s.difficulty === 'All')?.count || 0;
        const easySolved = submitStats.find(s => s.difficulty === 'Easy')?.count || 0;
        const mediumSolved = submitStats.find(s => s.difficulty === 'Medium')?.count || 0;
        const hardSolved = submitStats.find(s => s.difficulty === 'Hard')?.count || 0;

        // Total Available (Denominators)
        const totalQuestions = allQuestions.find(s => s.difficulty === 'All')?.count || 0;
        const easyQuestions = allQuestions.find(s => s.difficulty === 'Easy')?.count || 0;
        const mediumQuestions = allQuestions.find(s => s.difficulty === 'Medium')?.count || 0;
        const hardQuestions = allQuestions.find(s => s.difficulty === 'Hard')?.count || 0;

        user.integrations.leetcode.stats = {
            ranking: matchedUser.profile.ranking,
            total_solved: totalSolved,
            easy_solved: easySolved,
            medium_solved: mediumSolved,
            hard_solved: hardSolved,
            total_questions: totalQuestions,
            easy_questions: easyQuestions,
            medium_questions: mediumQuestions,
            hard_questions: hardQuestions,
            last_synced: new Date()
        };
        user.integrations.leetcode.lastSync = new Date();

        await user.save();
        console.log(`[Sync] LeetCode Sync Complete for ${username}`);
        return { success: true, stats: user.integrations.leetcode.stats };
    } catch (error) {
        console.error('LeetCode Sync Error:', error.message);
        throw error;
    }
};

const syncKaggle = async (user) => {
    const username = user.integrations?.kaggle?.username;
    const apiKey = user.integrations?.kaggle?.apiKey;

    if (!username) throw new Error('Kaggle username not linked');

    console.log(`[Sync] Starting Kaggle sync for ${username}...`);

    try {
        // Kaggle Public API requires authentication
        // For MVP: We'll fetch public profile data without API key
        // With API key: Can fetch competitions, datasets, notebooks

        const headers = apiKey ? {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        } : {};

        // Fetch public user profile (tier, rank, competitions)
        // Note: Kaggle API is limited, but we can try public endpoints
        const profileUrl = `https://www.kaggle.com/${username}`;

        // For MVP: Store basic info
        // In production: Use official Kaggle API with proper authentication
        user.integrations.kaggle.stats = {
            username: username,
            profile_url: profileUrl,
            last_synced: new Date(),
            // These would be populated with real API calls
            competitions: 0,
            notebooks: 0,
            datasets: 0
        };
        user.integrations.kaggle.lastSync = new Date();

        await user.save();
        console.log(`[Sync] Kaggle Sync Complete for ${username}`);
        return { success: true, stats: user.integrations.kaggle.stats };
    } catch (error) {
        console.error('Kaggle Sync Error:', error.message);
        throw error;
    }
};

const syncHuggingFace = async (user) => {
    const username = user.integrations?.huggingface?.username;
    const accessToken = user.integrations?.huggingface?.accessToken;

    if (!username) throw new Error('Hugging Face username not linked');

    console.log(`[Sync] Starting Hugging Face sync for ${username}...`);

    try {
        const headers = accessToken ? {
            'Authorization': `Bearer ${accessToken}`
        } : {};

        // Fetch models directly (user endpoint may not exist for all users)
        const modelsRes = await axios.get(`https://huggingface.co/api/models?author=${username}&limit=100`, { headers });
        const models = modelsRes.data || [];

        // Fetch spaces (apps)
        let spaces = [];
        try {
            const spacesRes = await axios.get(`https://huggingface.co/api/spaces?author=${username}&limit=100`, { headers });
            spaces = spacesRes.data || [];
        } catch (e) {
            console.warn('Could not fetch spaces:', e.message);
        }

        // Store stats
        user.integrations.huggingface.stats = {
            username: username,
            profile_url: `https://huggingface.co/${username}`,
            models_count: models.length,
            spaces_count: spaces.length,
            total_likes: models.reduce((sum, m) => sum + (m.likes || 0), 0),
            total_downloads: models.reduce((sum, m) => sum + (m.downloads || 0), 0),
            last_synced: new Date()
        };
        user.integrations.huggingface.lastSync = new Date();

        await user.save();
        console.log(`[Sync] Hugging Face Sync Complete for ${username}`);
        return { success: true, stats: user.integrations.huggingface.stats };
    } catch (error) {
        // If user has no models/spaces, still succeed but with empty stats
        if (error.response && error.response.status === 404) {
            user.integrations.huggingface.stats = {
                username: username,
                profile_url: `https://huggingface.co/${username}`,
                models_count: 0,
                spaces_count: 0,
                total_likes: 0,
                total_downloads: 0,
                last_synced: new Date()
            };
            user.integrations.huggingface.lastSync = new Date();
            await user.save();
            console.log(`[Sync] Hugging Face Sync Complete for ${username} (no public content)`);
            return { success: true, stats: user.integrations.huggingface.stats };
        }
        console.error('Hugging Face Sync Error:', error.message);
        throw error;
    }
};

module.exports = { syncGitHub, syncLeetCode, syncKaggle, syncHuggingFace };
