const mongoose = require('mongoose');

const ProfileSectionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['github', 'leetcode', 'kaggle', 'huggingface', 'projects', 'certifications', 'skills', 'about']
    },
    order: {
        type: Number,
        required: true
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { _id: false });

const UserSchema = new mongoose.Schema({
    githubId: {
        type: String,
        unique: true,
        sparse: true 
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    displayName: String,
    avatarUrl: String,
    bio: String,
    title: String,
    location: String,
    website: String,
    socials: {
        twitter: String,
        linkedin: String,
        youtube: String,
        kaggle: String,
        huggingface: String,
        blog: String
    },
    skills: [String],
    profileSections: [ProfileSectionSchema],
    accessToken: String, 
    lastSynced: Date,
    password: {
        type: String,
        select: false 
    },
    authProvider: {
        type: String,
        enum: ['github', 'email'],
        default: 'github'
    },
    // Integration Maps (Auth & Sync Status)
    integrations: {
        github: {
            username: String,
            accessToken: String, // Encrypted ideally
            lastSync: Date,
            stats: { type: mongoose.Schema.Types.Mixed, default: {} }
        },
        leetcode: {
            username: String,
            lastSync: Date,
            stats: { type: mongoose.Schema.Types.Mixed, default: {} }
        },
        codeforces: {
            username: String,
            lastSync: Date,
            stats: { type: mongoose.Schema.Types.Mixed, default: {} }
        },
        kaggle: {
            username: String,
            apiKey: String, // Encrypted
            lastSync: Date,
            stats: { type: mongoose.Schema.Types.Mixed, default: {} }
        },
        huggingface: {
            username: String,
            accessToken: String,
            lastSync: Date,
            stats: { type: mongoose.Schema.Types.Mixed, default: {} }
        },
        stackoverflow: {
            userId: String,
            lastSync: Date,
            stats: { type: mongoose.Schema.Types.Mixed, default: {} }
        }, 
        gitlab: {
            username: String,
            accessToken: String,
            lastSync: Date,
            stats: { type: mongoose.Schema.Types.Mixed, default: {} }
        }
    },

    // Pillar 2: Tech-Native Identity
    techStack: [{
        name: { type: String, required: true }, // "React", "Rust"
        proficiency: { type: Number, default: 0 }, // 0-100 calculated from usage
        category: { type: String, enum: ['frontend', 'backend', 'ml', 'devops', 'mobile', 'other', 'language'] },
        icon: String
    }],

    developerProfile: {
        title: { type: String }, // "Systems Engineer"
        bio: { type: String }, // Markdown enabled
        pinnedItems: [{
            type: { type: String, enum: ['repo', 'pr', 'notebook', 'model', 'post'] },
            platform: String,
            url: String,
            title: String,
            description: String,
            thumbnail: String
        }]
    },

    // Legacy Support (Optional overlap with Integrations)
    stats: { type: mongoose.Schema.Types.Mixed, default: {} },
    skills: [String],
    projects: [new mongoose.Schema({
        title: { type: String, required: true },
        description: String,
        link: String,
        tags: [String],
        image: String
    }, { timestamps: true })],
    certificates: [{
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        date: Date,
        link: String
    }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

UserSchema.pre('save', async function() {
    if (this.isNew && this.profileSections.length === 0) {
        this.profileSections = [
            { type: 'about', order: 0, isVisible: true },
            { type: 'skills', order: 1, isVisible: true },
            { type: 'github', order: 2, isVisible: true },
            { type: 'projects', order: 3, isVisible: true }
        ];
    }
});

module.exports = mongoose.model('User', UserSchema);
