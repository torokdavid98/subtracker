const { Subscription, Payment } = require('../models');
const { Op } = require('sequelize');

/**
 * Get subscription analytics
 */
async function getAnalytics(req, res) {
  try {
    const selectedYear = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

    // Only get active (non-deleted) subscriptions for the authenticated user
    const subscriptions = await Subscription.findAll({
      where: { userId: req.userId, deletedAt: null }
    });

    // Fetch only payments for the selected year for better performance
    // Use UTC dates to match database storage
    const yearStart = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));

    const payments = await Payment.findAll({
      where: {
        paymentDate: {
          [Op.between]: [yearStart, yearEnd]
        }
      },
      include: [{
        model: Subscription,
        required: true, // INNER JOIN to only include user's subscriptions
        where: { userId: req.userId }
      }],
    });

    // Calculate monthly and yearly totals from active subscriptions
    let monthlyTotal = 0;
    let yearlyTotal = 0;

    subscriptions.forEach(sub => {
      if (sub.billingCycle === 'monthly') {
        monthlyTotal += sub.cost;
        yearlyTotal += sub.cost * 12;
      } else if (sub.billingCycle === 'yearly') {
        monthlyTotal += sub.cost / 12;
        yearlyTotal += sub.cost;
      }
    });

    // Calculate by category from active subscriptions
    const byCategory = subscriptions.reduce((acc, sub) => {
      const category = sub.category || 'Uncategorized';
      const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;

      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += monthlyCost;
      return acc;
    }, {});

    // Calculate actual spending per month for selected year from payment history
    const monthlySpending = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(selectedYear, month, 1);
      const monthEnd = new Date(selectedYear, month + 1, 0, 23, 59, 59, 999);

      // Sum all payments in this month
      const monthTotal = payments
        .filter(payment => {
          const paymentDate = new Date(payment.paymentDate);
          return paymentDate >= monthStart && paymentDate <= monthEnd;
        })
        .reduce((sum, payment) => sum + payment.amount, 0);

      monthlySpending.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        total: parseFloat(monthTotal.toFixed(2))
      });
    }

    res.json({
      monthlyTotal,
      yearlyTotal,
      byCategory,
      totalSubscriptions: subscriptions.length,
      monthlySpending,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

module.exports = {
  getAnalytics,
};
