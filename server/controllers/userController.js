const User = require('../models/User');
const { fetchGitHubStats } = require('../services/githubService');
const { fetchLeetCodeStats } = require('../services/leetcodeService');
const { fetchHuggingFaceStats } = require('../services/huggingfaceService');
const axios = require('axios');

// @desc    Sync user stats
// @route   POST /api/users/sync-stats
// @access  Private
// Import consolidated services
const { syncGitHub, syncLeetCode, syncKaggle, syncHuggingFace } = require('../services/aggregatorService');

// @desc    Sync user stats (Consolidated)
// @route   POST /api/users/sync-stats
// @access  Private
const syncUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const updates = {};
        const syncPromises = [];

        // 1. Sync GitHub
        if (user.integrations?.github?.username) {
            syncPromises.push(syncGitHub(user).catch(e => console.error('GitHub Auto-Sync Failed:', e.message)));
        }

        // 2. Sync LeetCode
        if (user.integrations?.leetcode?.username) {
            syncPromises.push(syncLeetCode(user).catch(e => console.error('LeetCode Auto-Sync Failed:', e.message)));
        }

        // 3. Sync Kaggle
        if (user.integrations?.kaggle?.username) {
            syncPromises.push(syncKaggle(user).catch(e => console.error('Kaggle Auto-Sync Failed:', e.message)));
        }

        // 4. Sync HuggingFace
        if (user.integrations?.huggingface?.username) {
            syncPromises.push(syncHuggingFace(user).catch(e => console.error('HuggingFace Auto-Sync Failed:', e.message)));
        }

        await Promise.all(syncPromises);

        // Fetch updated user to return
        const updatedUser = await User.findById(req.user._id);

        // Refresh legacy stats objects if needed (Optional: UI often reads from user.integrations now)
        // But for safety, map them back if your UI expects user.stats.github
        // (Assuming the aggregatorService updates user.integrations.[platform].stats)

        if (!updatedUser.stats) updatedUser.stats = {};
        if (updatedUser.integrations.github?.stats) updatedUser.stats.github = updatedUser.integrations.github.stats;
        if (updatedUser.integrations.leetcode?.stats) updatedUser.stats.leetcode = updatedUser.integrations.leetcode.stats;
        if (updatedUser.integrations.kaggle?.stats) updatedUser.stats.kaggle = updatedUser.integrations.kaggle.stats;
        if (updatedUser.integrations.huggingface?.stats) updatedUser.stats.huggingface = updatedUser.integrations.huggingface.stats;

        await updatedUser.save();

        res.json(updatedUser);

    } catch (error) {
        console.error('Sync Stats Error:', error);
        res.status(500).json({ message: 'Failed to sync stats' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Basic Fields
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.displayName = req.body.displayName || user.displayName;
            if (req.body.skills) user.skills = req.body.skills;

            // LeetCode Username
            if (req.body.leetcodeUsername) {
                if (!user.stats) user.stats = {};
                if (!user.stats.leetcode) user.stats.leetcode = {};
                user.stats.leetcode.username = req.body.leetcodeUsername;
            }

            // Kaggle
            if (req.body.kaggleUsername) {
                if (!user.stats) user.stats = {};
                if (!user.stats.kaggle) user.stats.kaggle = {};
                user.stats.kaggle.username = req.body.kaggleUsername;
                if (!user.socials) user.socials = {};
                user.socials.kaggle = `https://kaggle.com/${req.body.kaggleUsername}`;
            }

            // HuggingFace
            if (req.body.huggingfaceUsername) {
                if (!user.stats) user.stats = {};
                if (!user.stats.huggingface) user.stats.huggingface = {};
                user.stats.huggingface.username = req.body.huggingfaceUsername;
                if (!user.socials) user.socials = {};
                user.socials.huggingface = `https://huggingface.co/${req.body.huggingfaceUsername}`;
            }

            // Socials
            if (req.body.blogUrl) {
                if (!user.socials) user.socials = {};
                user.socials.blog = req.body.blogUrl;
            }

            // Projects & Certificates
            if (req.body.projects) {
                user.projects = req.body.projects;
            }
            if (req.body.certificates) {
                user.certificates = req.body.certificates;
            }

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};

// @desc    Add a new project (Atomic Push)
// @route   POST /api/users/profile/projects
// @access  Private
const addProject = async (req, res) => {
    try {
        const { title, description, link, tags, image } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and Description are required' });
        }

        const newProject = {
            title,
            description,
            link: link || '',
            tags: tags || [],
            image: image || null
        };

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $push: { projects: newProject } },
            { new: true } // Return updated user
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(201).json(user.projects);
    } catch (error) {
        console.error('Add Project Error:', error);
        res.status(500).json({ message: 'Server error while adding project' });
    }
};

// @desc    Get project by ID
// @route   GET /api/users/:userId/projects/:projectId
// @access  Public
const getProjectById = async (req, res) => {
    try {
        const { userId, projectId } = req.params;
        const user = await User.findById(userId);

        if (!user || !user.projects) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const project = user.projects.id(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Return user minimal info + project
        res.json({
            author: {
                _id: user._id,
                displayName: user.displayName,
                username: user.username,
                avatarUrl: user.avatarUrl
            },
            project
        });

    } catch (error) {
        console.error('Get Project Error:', error);
        res.status(500).json({ message: 'Server error retrieving project' });
    }
}

// Search Users
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Query is required" });

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { displayName: { $regex: query, $options: 'i' } },
                { 'skills': { $regex: query, $options: 'i' } }
            ]
        }).select('username displayName avatarUrl headline skills followers following followRequests');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Follow User (Send Request)
const followUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow) return res.status(404).json({ message: "User not found" });

        // Check if already following
        if (userToFollow.followers.includes(req.user.id)) {
            return res.status(400).json({ message: "You already follow this user" });
        }

        // Check if already requested
        if (userToFollow.followRequests && userToFollow.followRequests.includes(req.user.id)) {
            return res.status(400).json({ message: "Follow request already sent" });
        }

        // Send Request
        await userToFollow.updateOne({ $push: { followRequests: req.user.id } });
        res.json({ message: "Follow request sent", status: 'requested' });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Unfollow User / Cancel Request
const unfollowUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }

        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToUnfollow) return res.status(404).json({ message: "User not found" });

        if (userToUnfollow.followers.includes(req.user.id)) {
            // Unfollow
            await userToUnfollow.updateOne({ $pull: { followers: req.user.id } });
            await currentUser.updateOne({ $pull: { following: req.params.id } });
            res.json({ message: "User unfollowed", status: 'none' });
        } else if (userToUnfollow.followRequests && userToUnfollow.followRequests.includes(req.user.id)) {
            // Cancel Request
            await userToUnfollow.updateOne({ $pull: { followRequests: req.user.id } });
            res.json({ message: "Follow request canceled", status: 'none' });
        } else {
            res.status(400).json({ message: "You are not following or requesting this user" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Accept Follow Request
const acceptFollowRequest = async (req, res) => {
    try {
        const requesterId = req.params.id; // User who sent the request
        const currentUser = await User.findById(req.user.id);
        const requester = await User.findById(requesterId);

        if (!currentUser || !requester) return res.status(404).json({ message: "User not found" });

        if (!currentUser.followRequests.includes(requesterId)) {
            return res.status(400).json({ message: "No follow request from this user" });
        }

        // Move from requests to followers
        await currentUser.updateOne({
            $pull: { followRequests: requesterId },
            $push: { followers: requesterId }
        });

        // Add to requester's following
        await requester.updateOne({ $push: { following: req.user.id } });

        res.json({ message: "Follow request accepted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Reject Follow Request
const rejectFollowRequest = async (req, res) => {
    try {
        const requesterId = req.params.id;
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) return res.status(404).json({ message: "User not found" });

        if (!currentUser.followRequests.includes(requesterId)) {
            return res.status(400).json({ message: "No follow request from this user" });
        }

        await currentUser.updateOne({ $pull: { followRequests: requesterId } });
        res.json({ message: "Follow request rejected" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get User by ID (Public/Private)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -__v') // Keep email hidden? Or maybe expose for messaging context if needed? Let's hide for now.
            .populate('followers', 'username displayName avatarUrl')
            .populate('following', 'username displayName avatarUrl');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get User By ID Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User by Username (Public)
const getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password -__v -email') // Exclude sensitive info. Email might be needed if public, but safer to hide by default.
            .populate('followers', 'username displayName avatarUrl')
            .populate('following', 'username displayName avatarUrl');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User Heatmap (Last 365 Days)
const getUserHeatmap = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const UnifiedEvent = require('../models/UnifiedEvent');
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const events = await UnifiedEvent.aggregate([
            {
                $match: {
                    user: user._id,
                    timestamp: { $gte: oneYearAgo }
                }
            },
            {
                $project: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    score: 1
                }
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 }, // Total events count
                    score: { $sum: "$score" } // Weighted score
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Transform to expected format { date: "YYYY-MM-DD", count: N, score: M }
        const heatmapData = events.map(e => ({
            date: e._id,
            count: e.count,
            score: e.score
        }));

        res.json(heatmapData);
    } catch (error) {
        console.error('Heatmap Error:', error);
        res.status(500).json({ message: 'Server error fetching heatmap' });
    }
};

// @desc    Add pinned item to user profile
// @route   POST /api/users/profile/pin
// @access  Private
const addPinnedItem = async (req, res) => {
    try {
        const { type, platform, url, title, description, thumbnail } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Validate max 6 pinned items
        if (!user.developerProfile) user.developerProfile = {};
        if (!user.developerProfile.pinnedItems) user.developerProfile.pinnedItems = [];

        if (user.developerProfile.pinnedItems.length >= 6) {
            return res.status(400).json({ message: 'Maximum 6 pinned items allowed' });
        }

        // Add new pinned item
        user.developerProfile.pinnedItems.push({
            type,
            platform,
            url,
            title,
            description,
            thumbnail
        });

        await user.save();
        res.json({ message: 'Item pinned successfully', pinnedItems: user.developerProfile.pinnedItems });
    } catch (error) {
        console.error('Add Pin Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove pinned item from user profile
// @route   DELETE /api/users/profile/pin/:index
// @access  Private
const removePinnedItem = async (req, res) => {
    try {
        const { index } = req.params;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.developerProfile?.pinnedItems || !user.developerProfile.pinnedItems[index]) {
            return res.status(404).json({ message: 'Pinned item not found' });
        }

        user.developerProfile.pinnedItems.splice(index, 1);
        await user.save();

        res.json({ message: 'Item unpinned successfully', pinnedItems: user.developerProfile.pinnedItems });
    } catch (error) {
        console.error('Remove Pin Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    syncUserStats,
    updateUserProfile,
    getProjectById,
    searchUsers,
    followUser,
    unfollowUser,
    acceptFollowRequest,
    rejectFollowRequest,
    getUserByUsername,
    getUserById,
    getUserHeatmap,
    addPinnedItem,
    removePinnedItem,
    addProject
};
