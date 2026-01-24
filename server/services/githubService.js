const axios = require('axios');

const fetchGitHubStats = async (accessToken) => {
    try {
        // 1. Fetch User Profile
        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const { followers, following, public_repos, login } = userRes.data;

        // 2. Fetch Repositories to count stars (GitHub API adds pagination, we'll fetch first 100 for now)
        const reposRes = await axios.get(`https://api.github.com/users/${login}/repos?per_page=100`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const total_stars = reposRes.data.reduce((acc, repo) => acc + repo.stargazers_count, 0);

        // Calculate Language Usage (Count of repos by primary language)
        const languages = {};
        reposRes.data.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });

        return {
            followers,
            following,
            public_repos,
            total_stars,
            languages,
            username: login,
            last_synced: new Date()
        };

    } catch (error) {
        console.error('GitHub Service Error:', error.response?.data || error.message);
        throw new Error('Failed to fetch GitHub stats');
    }
};

module.exports = { fetchGitHubStats };
