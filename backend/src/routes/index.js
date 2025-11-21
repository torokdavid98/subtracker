const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const authRoutes = require('./authRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const paymentRoutes = require('./paymentRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Public routes
router.use('/auth', authRoutes);

// Protected routes (require authentication)
router.use('/subscriptions', authMiddleware, subscriptionRoutes);
router.use('/payments', authMiddleware, paymentRoutes);
router.use('/analytics', authMiddleware, analyticsRoutes);

module.exports = router;
