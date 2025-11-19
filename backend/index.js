const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Subscription, syncDatabase } = require('./database');

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

// Create a subscription
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { name, cost, billingCycle, nextBillDate, description, category } = req.body;
    const subscription = await Subscription.create({
      name,
      cost: parseFloat(cost),
      billingCycle,
      nextBillDate: new Date(nextBillDate),
      description,
      category,
    });
    res.status(201).json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Update a subscription
app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const { name, cost, billingCycle, nextBillDate, description, category } = req.body;
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    await subscription.update({
      name,
      cost: parseFloat(cost),
      billingCycle,
      nextBillDate: new Date(nextBillDate),
      description,
      category,
    });
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

// Get subscription analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll();

    // Calculate monthly and yearly totals
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

    // Calculate by category
    const byCategory = subscriptions.reduce((acc, sub) => {
      const category = sub.category || 'Uncategorized';
      const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;

      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += monthlyCost;
      return acc;
    }, {});

    res.json({
      monthlyTotal,
      yearlyTotal,
      byCategory,
      totalSubscriptions: subscriptions.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  process.exit(0);
});
