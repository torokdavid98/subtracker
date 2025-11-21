const express = require('express');
const router = express.Router();
const {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');

// GET /api/subscriptions - Get all subscriptions
router.get('/', getAllSubscriptions);

// GET /api/subscriptions/:id - Get a single subscription
router.get('/:id', getSubscriptionById);

// POST /api/subscriptions - Create a subscription
router.post('/', createSubscription);

// PUT /api/subscriptions/:id - Update a subscription
router.put('/:id', updateSubscription);

// DELETE /api/subscriptions/:id - Delete a subscription (soft delete)
router.delete('/:id', deleteSubscription);

module.exports = router;
