const { Payment } = require('../models');

/**
 * Backfills payments for a subscription from its start date to current month
 * @param {Object} subscription - The subscription object
 */
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

module.exports = {
  backfillPayments,
};
