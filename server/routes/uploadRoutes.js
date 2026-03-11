const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

// POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // CloudinaryStorage attaches the full URL to req.file.path
        const filePath = req.file.path;
        
        res.status(200).json({ 
            message: 'File uploaded successfully',
            filePath: filePath
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

module.exports = router;
