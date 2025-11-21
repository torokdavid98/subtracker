const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
} = require('../controllers/paymentController');

// POST /api/payments - Record a payment
router.post('/', createPayment);

// GET /api/payments - Get all payments
router.get('/', getAllPayments);

module.exports = router;
