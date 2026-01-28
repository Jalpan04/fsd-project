const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        // Validation: User
        if (!req.user) {
            console.log('Error: User not found in request (Middleware failed?)');
            return res.status(401).json({ message: 'User authentication failed' });
        }

        // Validation: Content
        const { title, content, tags } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        // Slug Generation
        let slug;
        if (title && title.trim() !== 'Untitled') {
            slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now();
        } else {
            slug = 'post-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }

        // Create Object
        const newPost = new Post({
            title: title || 'Untitled',
            content,
            tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [], // Handle possible JSON string from FormData
            slug,
            author: req.user._id,
            image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || null),
            commentsCount: 0,
            likes: [],
            isPublished: true
        });


        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('CRITICAL CREATE POST ERROR:', error);
        res.status(500).json({
            message: 'Server error while creating post',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({ isPublished: true })
            .populate('author', 'displayName username avatarUrl')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Get Posts Error:', error);
        res.status(500).json({ message: 'Server error while fetching posts' });
    }
};

// @desc    Get post by slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug })
            .populate('author', 'displayName username avatarUrl');

        if (!post) {
            // Fallback: Check if valid ObjectId
            if (req.params.slug.match(/^[0-9a-fA-F]{24}$/)) {
                const postById = await Post.findById(req.params.slug).populate('author', 'displayName username avatarUrl');
                if (postById) return res.json(postById);
            }
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const index = post.likes.findIndex(id => id.toString() === req.user._id.toString());
        if (index === -1) {
            post.likes.push(req.user._id);
            // Create Notification
            if (post.author.toString() !== req.user._id.toString()) {
                const notification = await Notification.create({
                    recipient: post.author,
                    sender: req.user._id,
                    type: 'like',
                    post: post._id
                });

                // Emit Socket Event
                try {
                    const { getIo } = require('../socket/socketHandler');
                    const io = getIo();
                    io.to(post.author.toString()).emit('new_notification', {
                        message: `${req.user.displayName || req.user.username} liked your post`,
                        type: 'like',
                        notification
                    });
                } catch (err) {
                    console.error('Socket Emit Error (Like):', err.message);
                }
            }
        } else {
            post.likes.splice(index, 1);
        }
        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Like Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add a comment
// @route   POST /api/posts/:id/comments
// @access  Private
const createComment = async (req, res) => {
    try {
        const { content, parentComment } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const commentData = {
            content,
            post: req.params.id,
            author: req.user._id,
        };
        if (parentComment) {
            commentData.parentComment = parentComment;
        }
        const comment = await Comment.create(commentData);
        if (!parentComment) {
            post.commentsCount = (post.commentsCount || 0) + 1;
            await post.save();
        }

        // Create Notification
        let recipientId = post.author;
        let type = 'comment';

        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (parent) {
                recipientId = parent.author;
                type = 'reply';
            }
        }

        if (recipientId.toString() !== req.user._id.toString()) {
            const notification = await Notification.create({
                recipient: recipientId,
                sender: req.user._id,
                type: type,
                post: post._id,
                commentId: comment._id
            });

            // Emit Socket Event
            try {
                const { getIo } = require('../socket/socketHandler');
                const io = getIo();
                io.to(recipientId.toString()).emit('new_notification', {
                    message: `${req.user.displayName || req.user.username} ${type === 'reply' ? 'replied to you' : 'commented on your post'}`,
                    type: type,
                    notification
                });
            } catch (err) {
                console.error('Socket Emit Error (Comment):', err.message);
            }
        }

        await comment.populate('author', 'displayName username avatarUrl');
        res.json(comment);
    } catch (error) {
        console.error('Create Comment Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
const getPostComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id })
            .populate('author', 'displayName username avatarUrl')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Vote on a comment
// @route   POST /api/posts/comments/:id/vote
// @access  Private
const voteComment = async (req, res) => {
    try {
        const { type } = req.body;
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        const userId = req.user._id;
        if (!comment.upvotes) comment.upvotes = [];
        if (!comment.downvotes) comment.downvotes = [];
        const isUpvoted = comment.upvotes.includes(userId);
        if (type === 'upvote') {
            if (isUpvoted) {
                comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId.toString());
            } else {
                comment.upvotes.push(userId);
                comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId.toString());
            }
        }
        await comment.save();
        await comment.populate('author', 'displayName username avatarUrl');
        res.json(comment);
    } catch (error) {
        console.error('Comment Vote Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a post (author only)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }
        await Comment.deleteMany({ post: post._id });
        await post.deleteOne(); // Updated from remove()
        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Delete Post Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a comment (author only, cascades replies)
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }
        const deleteRecursive = async (parentId) => {
            const children = await Comment.find({ parentComment: parentId });
            for (const child of children) {
                await deleteRecursive(child._id);
                await child.deleteOne(); // Updated from remove()
            }
        };
        await deleteRecursive(comment._id);
        await comment.deleteOne(); // Updated from remove()
        if (!comment.parentComment) {
            await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
        }
        res.json({ message: 'Comment deleted', deletedId: comment._id });
    } catch (error) {
        console.error('Delete Comment Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get posts by author
// @route   GET /api/posts/user/:userId
// @access  Public
const getPostsByAuthor = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.userId, isPublished: true })
            .populate('author', 'displayName username avatarUrl')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Get Author Posts Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get posts from followed users
// @route   GET /api/posts/following
// @access  Private
const getFollowingPosts = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const following = currentUser.following;

        if (!following || following.length === 0) {
            return res.json([]);
        }

        const posts = await Post.find({
            author: { $in: following },
            isPublished: true
        })
            .populate('author', 'displayName username avatarUrl')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Get Following Posts Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostBySlug,
    likePost,
    createComment,
    getPostComments,
    voteComment,
    deletePost,
    deleteComment,
    getPostsByAuthor,
    getFollowingPosts
};
