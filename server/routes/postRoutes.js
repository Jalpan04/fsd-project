const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createPost, getAllPosts, getPostBySlug, likePost, createComment, getPostComments, voteComment, deletePost, deleteComment, getPostsByAuthor, getFollowingPosts, getLikedPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

// Post routes
router.get('/', getAllPosts);
router.get('/following', protect, getFollowingPosts);
router.get('/liked', protect, getLikedPosts);
router.post('/', protect, upload.single('image'), createPost);
router.get('/:slug', getPostBySlug);
router.get('/user/:userId', getPostsByAuthor);
router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, createComment);
router.get('/:id/comments', getPostComments);
router.post('/comments/:id/vote', protect, voteComment);

// Delete routes
router.delete('/:id', protect, deletePost);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

module.exports = router;
