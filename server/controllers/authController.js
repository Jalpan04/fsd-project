const axios = require('axios');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Auth with GitHub
// @route   POST /api/auth/github
// @access  Public
const githubAuth = async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Code is required' });
    }

    try {
        // 1. Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, {
            headers: { Accept: 'application/json' }
        });

        const { access_token } = tokenResponse.data;

        if (!access_token) {
            return res.status(400).json({ message: 'Invalid code or GitHub error' });
        }

        // 2. Get user profile from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const githubUser = userResponse.data;
        const { id, login, avatar_url, name, bio, email, blog, location, twitter_username } = githubUser;

        // 3. Find or Create User
        let user = await User.findOne({ githubId: id.toString() });

        if (user) {
            // Update token
            user.accessToken = access_token;
            // Update basic info if changed (optional, maybe configurable)
            user.avatarUrl = avatar_url;
            await user.save();
        } else {
            user = await User.create({
                githubId: id.toString(),
                username: login,
                email: email || `${login}@no-email.github.com`, // Handle missing email
                displayName: name || login,
                avatarUrl: avatar_url,
                bio: bio,
                location: location,
                website: blog,
                socials: {
                    twitter: twitter_username,
                    linkedin: '',
                    youtube: ''
                },
                accessToken: access_token
            });
        }

        // 4. Generate JWT
        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            token
        });

    } catch (error) {
        console.error('GitHub Auth Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Server error during authentication' });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // Re-fetch user to ensure populated fields
    const user = await User.findById(req.user._id)
        .populate('followRequests', 'username displayName avatarUrl headline')
        .populate('followers', 'username displayName avatarUrl headline')
        .populate('following', 'username displayName avatarUrl headline');

    res.status(200).json(user);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    console.log('Register request received:', req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Calculate default profile sections
        const defaultProfileSections = [
            { type: 'about', order: 0, isVisible: true },
            { type: 'skills', order: 1, isVisible: true },
            { type: 'projects', order: 2, isVisible: true }
        ];

        // Create user (githubId is required by schema, we need to handle this)
        const fakeGithubId = `email_${Date.now()}`;

        const user = await User.create({
            githubId: fakeGithubId, // temporary hack until schema migration
            username,
            email,
            password: hashedPassword,
            displayName: username,
            authProvider: 'email',
            profileSections: defaultProfileSections
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { githubAuth, getMe, registerUser, loginUser };
