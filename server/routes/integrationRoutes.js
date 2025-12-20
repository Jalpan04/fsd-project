const express = require('express');
const router = express.Router();
const { connectPlatform, syncPlatform } = require('../controllers/integrationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/connect', protect, connectPlatform);
router.post('/sync', protect, syncPlatform);

module.exports = router;
