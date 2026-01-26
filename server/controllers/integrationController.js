const User = require('../models/User');
const { syncGitHub, syncLeetCode, syncKaggle, syncHuggingFace } = require('../services/aggregatorService');

// @desc    Connect a platform (Save username/token)
// @route   POST /api/integrations/connect
// @access  Private
const connectPlatform = async (req, res) => {
    try {
        const { platform, username, accessToken, apiKey, userId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.integrations[platform]) {
            // Initialize object if undefined (though Schema default handles this mostly)
            user.integrations[platform] = {};
        }

        // Update fields based on platform
        if (platform === 'github') {
            user.integrations.github.username = username;
            if (accessToken) user.integrations.github.accessToken = accessToken;
        } else if (platform === 'leetcode') {
            user.integrations.leetcode.username = username;
        } else if (platform === 'kaggle') {
            user.integrations.kaggle.username = username;
            if (apiKey) user.integrations.kaggle.apiKey = apiKey;
        } else if (platform === 'stackoverflow') {
            user.integrations.stackoverflow.userId = userId;
        } else if (platform === 'codeforces') {
            user.integrations.codeforces.username = username;
        } else if (platform === 'huggingface') {
            user.integrations.huggingface.username = username;
            if (accessToken) user.integrations.huggingface.accessToken = accessToken;
        } else {
            return res.status(400).json({ message: 'Platform not supported yet' });
        }

        await user.save();
        res.json({ message: `Connected ${platform} successfully`, integrations: user.integrations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Manually Trigger Sync for a platform
// @route   POST /api/integrations/sync
// @access  Private


const syncPlatform = async (req, res) => {
    try {
        const { platform } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Validate integration existence
        if (platform === 'github') {
            if (!user.integrations?.github?.username) {
                return res.status(400).json({ message: 'GitHub integration not configured' });
            }
        } else if (platform === 'leetcode') {
            if (!user.integrations?.leetcode?.username) {
                return res.status(400).json({ message: 'LeetCode integration not configured' });
            }
        } else if (platform === 'kaggle') {
            if (!user.integrations?.kaggle?.username) {
                return res.status(400).json({ message: 'Kaggle integration not configured' });
            }
        } else if (platform === 'huggingface') {
            if (!user.integrations?.huggingface?.username) {
                return res.status(400).json({ message: 'Hugging Face integration not configured' });
            }
        }

        let result;
        if (platform === 'github') {
            result = await syncGitHub(user);
        } else if (platform === 'leetcode') {
            result = await syncLeetCode(user);
        } else if (platform === 'kaggle') {
            result = await syncKaggle(user);
        } else if (platform === 'huggingface') {
            result = await syncHuggingFace(user);
        } else {
            return res.status(400).json({ message: 'Sync not implemented for this platform yet' });
        }

        res.json({ message: 'Sync complete', result });
    } catch (error) {
        console.error('Sync error message:', error.message);

        // Handle specific known errors as 400 Bad Request
        if (error.message.includes('Kaggle API Key is required') || error.message.includes('Kaggle username not linked')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('Invalid Kaggle API Key') || error.message.includes('Invalid Kaggle Credentials')) {
            return res.status(401).json({ message: error.message });
        }

        console.error('Sync error stack:', error.stack);
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        res.status(500).json({ message: 'Sync failed', error: error.message });
    }
};

module.exports = { connectPlatform, syncPlatform };
