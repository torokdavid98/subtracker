const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');

// GET /api/analytics - Get subscription analytics
router.get('/', getAnalytics);

module.exports = router;
