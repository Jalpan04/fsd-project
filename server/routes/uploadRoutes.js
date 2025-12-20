const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

// POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the path that can be used to access the file
        // Since we will serve 'uploads' statically at '/uploads', the path is /uploads/filename
        const filePath = `/uploads/${req.file.filename}`;
        
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
