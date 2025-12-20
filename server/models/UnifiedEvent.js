const mongoose = require('mongoose');

const UnifiedEventSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    platform: { 
        type: String, 
        enum: ['github', 'gitlab', 'leetcode', 'codeforces', 'kaggle', 'huggingface', 'stackoverflow', 'medium', 'devto', 'hashnode'], 
        required: true 
    },
    eventType: { 
        type: String, 
        required: true 
    }, // e.g., 'commit', 'pr_merge', 'contest_rating', 'model_publish', 'answer'
    
    externalId: { 
        type: String, 
        unique: true, 
        sparse: true 
    }, // To prevent duplicates (e.g., 'github_commit_sha'). Sparse allows nulls if needed by some platforms.
    
    timestamp: { 
        type: Date, 
        required: true, 
        index: true 
    },
    
    score: { 
        type: Number, 
        default: 0 
    }, // Weighted score for heatmap
    
    // Normalized Display Metadata (The "Card")
    title: { type: String }, // "Fixed Bug in Auth" or "Solved Two Sum"
    url: { type: String }, // Link to external resource
    thumbnail: { type: String }, // Optional image
    description: { type: String }, // Brief snippet
    
    // Platform Specific Details (Flexible)
    payload: { 
        type: mongoose.Schema.Types.Mixed 
    } 
}, { timestamps: true });

// Compound index for efficient heatmap query: Get all events for user X sorted by time
UnifiedEventSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('UnifiedEvent', UnifiedEventSchema);
