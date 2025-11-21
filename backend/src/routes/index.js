const express = require('express');
const router = express.Router();

const subscriptionRoutes = require('./subscriptionRoutes');
const paymentRoutes = require('./paymentRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Mount routes
router.use('/subscriptions', subscriptionRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
