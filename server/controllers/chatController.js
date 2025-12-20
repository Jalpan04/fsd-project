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
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        // Transform to friendly format (remove self from participants)
        const formatted = conversations.map(conv => {
            const otherParticipant = conv.participants.find(
                p => p._id.toString() !== req.user._id.toString()
            );
            return {
                _id: conv._id,
                partner: otherParticipant,
                lastMessage: conv.lastMessage,
                updatedAt: conv.updatedAt
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
        const { recipientId, content } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!recipientId || (!content && !image)) {
            return res.status(400).json({ message: 'Recipient and content or image are required' });
        }

        // 1. Create Message
        const newMessage = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content: content || '',
            image
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
            io.to(recipientId).emit('receive_message', {
                message: newMessage,
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
                conversationId: userId // or actual conv ID if needed
            });
        } catch (err) {
            console.error('Socket error in markAsRead:', err);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Mark as Read Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead
};
