const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String
    },
    image: {
        type: String
    },
    read: {
        type: Boolean,
        default: false
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    sharedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
