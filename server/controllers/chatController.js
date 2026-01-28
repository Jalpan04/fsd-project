const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User'); // Ensure User model is loaded
const { getIo } = require('../socket/socketHandler');

// @desc    Get all conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: { $in: [req.user._id] }
        })
            .populate('participants', 'displayName username avatarUrl')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sharedPost', select: 'content' } // Optional preview
            })
            .sort({ updatedAt: -1 });

        // Count unread messages per sender
        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    recipient: req.user._id,
                    read: false
                }
            },
            {
                $group: {
                    _id: '$sender',
                    count: { $sum: 1 }
                }
            }
        ]);

        const unreadMap = {};
        unreadCounts.forEach(u => {
            unreadMap[u._id.toString()] = u.count;
        });

        // Transform to friendly format (remove self from participants)
        const formatted = conversations.map(conv => {
            const otherParticipant = conv.participants.find(
                p => p._id.toString() !== req.user._id.toString()
            );
            return {
                _id: conv._id,
                partner: otherParticipant,
                lastMessage: conv.lastMessage,
                updatedAt: conv.updatedAt,
                unreadCount: otherParticipant ? (unreadMap[otherParticipant._id.toString()] || 0) : 0
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get messages with a specific user
// @route   GET /api/chat/:userId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find messages where (sender is me AND recipient is them) OR (sender is them AND recipient is me)
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id }
            ]
        })
            .populate({
                path: 'sharedPost',
                populate: { path: 'author', select: 'displayName username avatarUrl' }
            })
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content, sharedPostId } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!recipientId || (!content && !image && !sharedPostId)) {
            return res.status(400).json({ message: 'Recipient and content or image or shared post are required' });
        }

        // 1. Create Message
        const newMessage = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content: content || '',
            image,
            sharedPost: sharedPostId || null
        });

        // 2. Find or Create Conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, recipientId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, recipientId],
                lastMessage: newMessage._id
            });
        } else {
            conversation.lastMessage = newMessage._id;
            await conversation.save();
        }

        // Link message to conversation
        newMessage.conversationId = conversation._id;
        await newMessage.save();

        // 3. Emit Socket Event
        try {
            const io = getIo();
            // Emit to recipient's room (their User ID)
            const populatedMessage = await Message.findById(newMessage._id).populate({
                path: 'sharedPost',
                populate: { path: 'author', select: 'displayName username avatarUrl' }
            });

            io.to(recipientId).emit('receive_message', {
                message: populatedMessage,
                sender: {
                    _id: req.user._id,
                    username: req.user.username,
                    displayName: req.user.displayName,
                    avatarUrl: req.user.avatarUrl
                }
            });
        } catch (socketError) {
            console.error('Socket Emission Error:', socketError);
            // Don't fail the request if socket fails, just log it
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:userId/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        // Update all unread messages from this sender to me
        await Message.updateMany(
            { sender: userId, recipient: req.user._id, read: false },
            { $set: { read: true } }
        );

        // Emit 'messages_read' event to the sender (so they see the blue ticks)
        try {
            const io = getIo();
            io.to(userId).emit('messages_read', {
                readerId: req.user._id,
                conversationId: userId
            });

            // Emit 'unread_update' to SELF (the reader) so Sidebar badge updates
            io.to(req.user._id.toString()).emit('unread_update');

        } catch (err) {
            console.error('Socket error in markAsRead:', err);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Mark as Read Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get count of conversations with unread messages
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        // Count distinct senders of unread messages addressed to current user
        const unreadSenders = await Message.distinct('sender', {
            recipient: req.user._id,
            read: false
        });

        res.json({ count: unreadSenders.length });
    } catch (error) {
        console.error('Get Unread Count Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount
};
