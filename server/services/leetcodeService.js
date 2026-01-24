const axios = require('axios');

const fetchLeetCodeStats = async (username) => {
    try {
        // LeetCode GraphQL Query
        const query = `
            query userProblemsSolved($username: String!) {
                allQuestionsCount { difficulty count }
                matchedUser(username: $username) {
                    submitStats {
                        acSubmissionNum { difficulty count }
                    }
                    profile { ranking }
                }
            }
        `;

        const response = await axios.post('https://leetcode.com/graphql', {
            query,
            variables: { username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            }
        });

        const data = response.data.data;
        if (!data.matchedUser) {
            throw new Error('LeetCode user not found');
        }

        const stats = data.matchedUser.submitStats.acSubmissionNum;
        const totalSolved = stats.find(s => s.difficulty === 'All').count;
        const easySolved = stats.find(s => s.difficulty === 'Easy').count;
        const mediumSolved = stats.find(s => s.difficulty === 'Medium').count;
        const hardSolved = stats.find(s => s.difficulty === 'Hard').count;

        const allQuestions = data.allQuestionsCount;
        const totalQuestions = allQuestions.find(s => s.difficulty === 'All')?.count || 0;
        const easyQuestions = allQuestions.find(s => s.difficulty === 'Easy')?.count || 0;
        const mediumQuestions = allQuestions.find(s => s.difficulty === 'Medium')?.count || 0;
        const hardQuestions = allQuestions.find(s => s.difficulty === 'Hard')?.count || 0;

        return {
            username,
            ranking: data.matchedUser.profile.ranking,
            total_solved: totalSolved,
            easy_solved: easySolved,
            medium_solved: mediumSolved,
            hard_solved: hardSolved,
            total_questions: totalQuestions, // Added
            easy_questions: easyQuestions,   // Added
            medium_questions: mediumQuestions, // Added
            hard_questions: hardQuestions,   // Added
            last_synced: new Date()
        };

    } catch (error) {
        console.error('LeetCode Service Error:', error.message);
        throw new Error('Failed to fetch LeetCode stats');
    }
};

module.exports = { fetchLeetCodeStats };
