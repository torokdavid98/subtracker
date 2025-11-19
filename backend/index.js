const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { Subscription, Payment, syncDatabase } = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database
syncDatabase();

// Get all subscriptions
app.get('/api/subscriptions', async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Get a single subscription
app.get('/api/subscriptions/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Helper function to backfill payments
async function backfillPayments(subscription) {
  const startDate = new Date(subscription.startDate);
  const currentDate = new Date();
  const cost = subscription.cost;

  // Normalize dates to first of month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  let paymentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (paymentDate <= new Date(currentYear, currentMonth, 1)) {
    const shouldCharge = subscription.billingCycle === 'monthly' ||
                        (subscription.billingCycle === 'yearly' && paymentDate.getMonth() === startDate.getMonth());

    if (shouldCharge) {
      // Check if payment already exists for this month
      const existingPayment = await Payment.findOne({
        where: {
          subscriptionId: subscription.id,
          paymentDate: paymentDate,
        },
      });

      if (!existingPayment) {
        await Payment.create({
          subscriptionId: subscription.id,
          amount: cost,
          paymentDate: new Date(paymentDate),
        });
      }
    }

    // Move to next month
    paymentDate.setMonth(paymentDate.getMonth() + 1);
  }
}

// Create a subscription
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { name, cost, billingCycle, startDate, description, category } = req.body;
    const subscription = await Subscription.create({
      name,
      cost: parseFloat(cost),
      billingCycle,
      startDate: new Date(startDate),
      description,
      category,
    });

    // Backfill payments from startDate to current month
    await backfillPayments(subscription);

    res.status(201).json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Update a subscription
app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const { name, cost, billingCycle, startDate, description, category } = req.body;
    const subscription = await Subscription.findByPk(req.params.id);
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
});

// Delete a subscription
app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    await subscription.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

// Record a payment
app.post('/api/payments', async (req, res) => {
  try {
    const { subscriptionId, amount, paymentDate } = req.body;
    const payment = await Payment.create({
      subscriptionId,
      amount: parseFloat(amount),
      paymentDate: new Date(paymentDate),
    });
    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Get all payments
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await Payment.findAll({
      order: [['paymentDate', 'DESC']],
    });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get subscription analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll();
    const payments = await Payment.findAll({
      include: [{
        model: Subscription,
        required: false, // LEFT JOIN to include payments from deleted subscriptions
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

    // Calculate actual spending per month for current year from payment history
    const monthlySpending = [];
    const currentYear = new Date().getFullYear();

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59, 999);

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
});

// Monthly cron job - runs at midnight on the 1st of each month
// Cron format: '0 0 1 * *' = minute hour day-of-month month day-of-week
cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly payment cron job...');
  try {
    const subscriptions = await Subscription.findAll();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    for (const subscription of subscriptions) {
      const startDate = new Date(subscription.startDate);

      // Check if subscription should be charged this month
      const shouldCharge = subscription.billingCycle === 'monthly' ||
                          (subscription.billingCycle === 'yearly' && currentMonth === startDate.getMonth());

      if (shouldCharge) {
        // Check if payment already exists for this month
        const paymentDate = new Date(currentYear, currentMonth, 1);
        const existingPayment = await Payment.findOne({
          where: {
            subscriptionId: subscription.id,
            paymentDate: paymentDate,
          },
        });

        if (!existingPayment) {
          await Payment.create({
            subscriptionId: subscription.id,
            amount: subscription.cost,
            paymentDate: paymentDate,
          });
          console.log(`Created payment for ${subscription.name} - $${subscription.cost}`);
        }
      }
    }
    console.log('Monthly payment cron job completed.');
  } catch (error) {
    console.error('Error in monthly payment cron job:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Monthly payment cron job scheduled for 1st of each month at midnight');
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  process.exit(0);
});
