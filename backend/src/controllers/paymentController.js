const { Payment } = require('../models');

/**
 * Record a new payment
 */
async function createPayment(req, res) {
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
}

/**
 * Get all payments
 */
async function getAllPayments(req, res) {
  try {
    const payments = await Payment.findAll({
      order: [['paymentDate', 'DESC']],
    });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
}

module.exports = {
  createPayment,
  getAllPayments,
};
