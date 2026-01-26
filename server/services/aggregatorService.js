const axios = require('axios');
const cheerio = require('cheerio'); // Keep if needed later, or remove
const UnifiedEvent = require('../models/UnifiedEvent');
const User = require('../models/User');

const calculateScore = (type) => {
    switch (type) {
        case 'PushEvent': return 1;
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
        const isValidToken = accessToken && (
            accessToken.startsWith('ghp_') ||
            accessToken.startsWith('github_pat_') ||
            /^[a-f0-9]{40}$/i.test(accessToken)
        );
        const headers = isValidToken ? { Authorization: `Bearer ${accessToken}` } : {};

        // 1. Fetch User Profile Stats
        const profileRes = await axios.get(`https://api.github.com/users/${username}`, { headers });
        const { followers, following, public_repos } = profileRes.data;

        // Fetch Repos for Stars/Languages (Pagination added to support >100 repos)
        // Fetches up to 500 repos max to prevent rate limit issues in MVP
        let allRepos = [];
        for (let page = 1; page <= 5; page++) {
            const rRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}&type=all`, { headers });
            const pRepos = rRes.data || [];
            allRepos = allRepos.concat(pRepos);
            if (pRepos.length < 100) break;
        }

        const total_stars = allRepos.reduce((acc, repo) => acc + repo.stargazers_count, 0);

        // Calculate Languages
        const languages = {};
        allRepos.forEach(repo => {
            if (repo.language) languages[repo.language] = (languages[repo.language] || 0) + 1;
        });

        // 2. Fetch Activity Events
        const eventsRes = await axios.get(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers });

        let newEventsCount = 0;
        let commitsCount = 0;
        let prsCount = 0;
        let issuesCount = 0;

        for (const event of eventsRes.data) {
            if (event.type === 'PushEvent') {
                const size = event.payload.commits ? event.payload.commits.length : (event.payload.size || 0);
                commitsCount += size;
            } else if (event.type === 'PullRequestEvent' && event.payload.action === 'opened') {
                prsCount++;
            } else if (event.type === 'IssuesEvent' && event.payload.action === 'opened') {
                issuesCount++;
            }
        }

        // 3. Fetch Total Contributions (GraphQL)
        let totalContributions = 0;
        if (isValidToken) {
            try {
                const gqlQuery = `
                query {
                    user(login: "${username}") {
                        contributionsCollection {
                            contributionCalendar {
                                totalContributions
                            }
                        }
                    }
                }`;
                const gqlRes = await axios.post('https://api.github.com/graphql', { query: gqlQuery }, { headers });
                totalContributions = gqlRes.data?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0;
                console.log(`[Sync] GitHub Total Contributions: ${totalContributions}`);
            } catch (gqlError) {
                console.warn('[Sync] GitHub GraphQL Error:', gqlError.message);
                if (totalContributions === 0) totalContributions = commitsCount;
            }
        }

        user.integrations.github.stats = {
            followers,
            following,
            public_repos,
            total_stars,
            languages,
            commits: commitsCount,
            total_contributions: totalContributions,
            prs: prsCount,
            issues: issuesCount
        };
        user.integrations.github.lastSync = new Date();

        // Save Events Logic (Simplified for brevity, same as before)
        for (const event of eventsRes.data) {
            try {
                const exists = await UnifiedEvent.exists({ externalId: String(event.id) });
                if (exists) continue;
                const score = calculateScore(event.type);
                let description = null;
                if (event.type === 'PushEvent' && event.payload.commits && event.payload.commits.length > 0) {
                    description = event.payload.commits[0].message;
                }
                const unifiedEvent = new UnifiedEvent({
                    user: user._id,
                    platform: 'github',
                    eventType: event.type,
                    externalId: String(event.id),
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
            } catch (e) { continue; }
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
    // ... (Keep existing LeetCode logic)
    const username = user.integrations?.leetcode?.username;
    if (!username) throw new Error('LeetCode username not linked');
    console.log(`[Sync] Starting LeetCode sync for ${username}...`);
    try {
        const query = `
            query getUserProfile($username: String!) {
                allQuestionsCount { difficulty count }
                matchedUser(username: $username) {
                    username
                    submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } }
                    profile { ranking }
                }
            }
        `;
        const response = await axios.post('https://leetcode.com/graphql', { query, variables: { username } });
        const data = response.data?.data;
        if (!data || !data.matchedUser) throw new Error('LeetCode user not found');
        const matchedUser = data.matchedUser;
        const submitStats = matchedUser.submitStats.acSubmissionNum;
        const allQuestions = data.allQuestionsCount;

        user.integrations.leetcode.stats = {
            ranking: matchedUser.profile.ranking,
            total_solved: submitStats.find(s => s.difficulty === 'All')?.count || 0,
            easy_solved: submitStats.find(s => s.difficulty === 'Easy')?.count || 0,
            medium_solved: submitStats.find(s => s.difficulty === 'Medium')?.count || 0,
            hard_solved: submitStats.find(s => s.difficulty === 'Hard')?.count || 0,
            total_questions: allQuestions.find(s => s.difficulty === 'All')?.count || 0,
            easy_questions: allQuestions.find(s => s.difficulty === 'Easy')?.count || 0,
            medium_questions: allQuestions.find(s => s.difficulty === 'Medium')?.count || 0,
            hard_questions: allQuestions.find(s => s.difficulty === 'Hard')?.count || 0,
            last_synced: new Date()
        };
        user.integrations.leetcode.lastSync = new Date();
        await user.save();
        return { success: true, stats: user.integrations.leetcode.stats };
    } catch (error) {
        console.error('LeetCode Sync Error:', error.message);
        throw error;
    }
};

const syncKaggle = async (user) => {
    const username = user.integrations?.kaggle?.username;
    let apiKey = user.integrations?.kaggle?.apiKey;

    if (!username) throw new Error('Kaggle username not linked');

    // Robust API Key Parsing & Username Auto-Correction
    if (apiKey) {
        apiKey = apiKey.trim();
        let jsonUsername = null;

        // Case 1: User pasted full JSON object
        if (apiKey.includes('"key":') || apiKey.includes("'key':")) {
            try {
                const json = JSON.parse(apiKey);
                if (json.key) apiKey = json.key;
                if (json.username) jsonUsername = json.username;
            } catch (e) {
                const matchKey = apiKey.match(/['"]?key['"]?\s*[:=]\s*['"]?([a-f0-9]{32})['"]?/i);
                if (matchKey && matchKey[1]) apiKey = matchKey[1];

                const matchUser = apiKey.match(/['"]?username['"]?\s*[:=]\s*['"]?([a-zA-Z0-9_-]+)['"]?/i);
                if (matchUser && matchUser[1]) jsonUsername = matchUser[1];
            }
        } else {
            // Case 2: Clean quotes and whitespace if raw key
            apiKey = apiKey.replace(/['"\s]/g, '').trim();
        }

        // Auto-fix Username if provided in JSON
        if (jsonUsername && jsonUsername.toLowerCase() !== username.toLowerCase()) {
            console.log(`[Sync] Auto-correcting Kaggle Username: ${username} -> ${jsonUsername}`);
            user.integrations.kaggle.username = jsonUsername;
            try { await user.save(); } catch (e) { console.error('Auto-save failed:', e.message); }
        }
    } else {
        throw new Error('Kaggle API Key is required for stats syncing.');
    }

    // Refresh username and trim whitespace safety
    const finalUsername = (user.integrations.kaggle.username || '').trim();

    if (!finalUsername) {
        throw new Error('Kaggle Username is missing. Please update your credentials.');
    }

    console.log(`[Sync] Starting Kaggle API sync for "${finalUsername}" (Key Len: ${apiKey.length})...`);

    // Auth Logic: KGAT (Bearer) vs Legacy (Basic)
    let axiosConfig = {};
    if (apiKey.startsWith('KGAT_')) {
        console.log('[Sync] Detected KGAT Token. Using Bearer Auth.');
        axiosConfig = { headers: { 'Authorization': `Bearer ${apiKey}` } };
    } else {
        console.log('[Sync] Detected Legacy Key. Using Basic Auth.');
        const authHeader = 'Basic ' + Buffer.from(`${finalUsername}:${apiKey}`).toString('base64');
        axiosConfig = { headers: { 'Authorization': authHeader } };
    }

    try {
        let kaggleStats = {
            competitions: 0,
            datasets: 0,
            notebooks: 0,
            discussions: 0,
            rank: 'Unranked'
        };

        // 1. Competitions (Participated)
        try {
            const compsRes = await axios.get(`https://www.kaggle.com/api/v1/competitions/list?group=entered`, axiosConfig);
            if (compsRes.data) kaggleStats.competitions = compsRes.data.length;
        } catch (e) {
            console.warn(`[Sync] Kaggle Competitions API failed (User: ${finalUsername}):`, e.message);
            if (e.response && e.response.status === 401) {
                // Throw verbose error for debugging with user hint
                throw new Error(`Kaggle Auth Failed (401). Used Username: "${finalUsername}". If this is wrong, paste the FULL 'kaggle.json' content to auto-correct it.`);
            }
        }

        // 2. Datasets (Created)
        try {
            const datasetsRes = await axios.get(`https://www.kaggle.com/api/v1/datasets/list?user=${finalUsername}`, axiosConfig);
            if (datasetsRes.data) kaggleStats.datasets = datasetsRes.data.length;
        } catch (e) { console.warn('[Sync] Kaggle Datasets API failed:', e.message); }

        // 3. Kernels (Notebooks - Created)
        try {
            const kernelsRes = await axios.get(`https://www.kaggle.com/api/v1/kernels/list?user=${finalUsername}`, axiosConfig);
            if (kernelsRes.data) kaggleStats.notebooks = kernelsRes.data.length;
        } catch (e) { console.warn('[Sync] Kaggle Kernels API failed:', e.message); }

        user.integrations.kaggle.stats = {
            username: finalUsername,
            profile_url: `https://www.kaggle.com/${finalUsername}`,
            last_synced: new Date(),
            competitions: kaggleStats.competitions,
            kernels: kaggleStats.notebooks,
            datasets: kaggleStats.datasets,
            discussions: 0
        };
        user.integrations.kaggle.lastSync = new Date();

        await user.save();
        console.log(`[Sync] Kaggle Sync Complete for ${finalUsername}`);
        return { success: true, stats: user.integrations.kaggle.stats };
    } catch (error) {
        console.error('Kaggle Sync Error:', error.message);
        throw error;
    }
};

const syncHuggingFace = async (user) => {
    // ... (Keep existing Logic)
    const username = user.integrations?.huggingface?.username;
    const accessToken = user.integrations?.huggingface?.accessToken;
    if (!username) throw new Error('Hugging Face username not linked');
    console.log(`[Sync] Starting Hugging Face sync for ${username}...`);
    try {
        const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
        const modelsRes = await axios.get(`https://huggingface.co/api/models?author=${username}&limit=100`, { headers });
        const models = modelsRes.data || [];
        let spaces = [];
        try {
            const spacesRes = await axios.get(`https://huggingface.co/api/spaces?author=${username}&limit=100`, { headers });
            spaces = spacesRes.data || [];
        } catch (e) { }
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
        return { success: true, stats: user.integrations.huggingface.stats };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            user.integrations.huggingface.stats = {
                username: username,
                profile_url: `https://huggingface.co/${username}`,
                models_count: 0, spaces_count: 0, total_likes: 0, total_downloads: 0, last_synced: new Date()
            };
            user.integrations.huggingface.lastSync = new Date();
            await user.save();
            return { success: true, stats: user.integrations.huggingface.stats };
        }
        console.error('Hugging Face Sync Error:', error.message);
        throw error;
    }
};

module.exports = { syncGitHub, syncLeetCode, syncKaggle, syncHuggingFace };
