const { Subscription, Payment } = require('../models');
const { backfillPayments } = require('../services/paymentService');

/**
 * Get all subscriptions
 */
async function getAllSubscriptions(req, res) {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const whereClause = includeDeleted ? { userId: req.userId } : { userId: req.userId, deletedAt: null };

    const subscriptions = await Subscription.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
    res.json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
}

/**
 * Get a single subscription by ID
 */
async function getSubscriptionById(req, res) {
  try {
    const subscription = await Subscription.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}

/**
 * Create a new subscription
 */
async function createSubscription(req, res) {
  try {
    const { name, cost, billingCycle, startDate, description, category, currency } = req.body;
    const subscription = await Subscription.create({
      name,
      cost: parseFloat(cost),
      billingCycle,
      startDate: new Date(startDate),
      description,
      category,
      currency: currency || 'HUF',
      userId: req.userId,
    });

    // Backfill payments from startDate to current month
    await backfillPayments(subscription);

    res.status(201).json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}

/**
 * Update a subscription
 */
async function updateSubscription(req, res) {
  try {
    const { name, cost, billingCycle, startDate, description, category, currency } = req.body;
    const subscription = await Subscription.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const oldCost = subscription.cost;
    const oldStartDate = subscription.startDate;
    const oldBillingCycle = subscription.billingCycle;

    await subscription.update({
      name,
      cost: parseFloat(cost),
      billingCycle,
      startDate: new Date(startDate),
      description,
      category,
      currency: currency || subscription.currency || 'HUF',
    });

    // If cost, startDate, or billingCycle changed, recalculate payments
    if (oldCost !== parseFloat(cost) ||
        oldStartDate.getTime() !== new Date(startDate).getTime() ||
        oldBillingCycle !== billingCycle) {
      // Delete existing payments and backfill with new values
      await Payment.destroy({
        where: { subscriptionId: subscription.id }
      });
      await backfillPayments(subscription);
    }

    res.json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
}

/**
 * Delete a subscription (soft delete)
 */
async function deleteSubscription(req, res) {
  try {
    const subscription = await Subscription.findOne({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    // Soft delete by setting deletedAt
    await subscription.update({ deletedAt: new Date() });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
}

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
