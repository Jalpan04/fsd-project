const express = require('express');
const router = express.Router();

const { 
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
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public route to fetch project details
router.get('/:userId/projects/:projectId', getProjectById);

// Social & Search
router.get('/search', searchUsers); 
router.put('/:id/follow', protect, followUser);
router.put('/:id/unfollow', protect, unfollowUser); // Functions as cancel if request
router.put('/:id/accept', protect, acceptFollowRequest);
router.put('/:id/reject', protect, rejectFollowRequest);

router.post('/sync-stats', protect, syncUserStats);
router.put('/profile', protect, updateUserProfile);
router.post('/profile/projects', protect, addProject);
router.post('/profile/pin', protect, addPinnedItem);
router.delete('/profile/pin/:index', protect, removePinnedItem);

// Public Profile (Keep specific routes above this wildcard if any)
router.get('/id/:id', getUserById);
router.get('/:username/heatmap', getUserHeatmap); // Specific route first
router.get('/:username', getUserByUsername);

module.exports = router;
