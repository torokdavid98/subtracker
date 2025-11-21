const cron = require('node-cron');
const { Subscription, Payment } = require('../models');

/**
 * Initializes and starts the monthly payment cron job
 * Runs at midnight on the 1st of each month
 */
function startMonthlyPaymentCron() {
  // Cron format: '0 0 1 * *' = minute hour day-of-month month day-of-week
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running monthly payment cron job...');
    try {
      // Only charge active (non-deleted) subscriptions
      const subscriptions = await Subscription.findAll({
        where: { deletedAt: null }
      });
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

  console.log('Monthly payment cron job scheduled for 1st of each month at midnight');
}

module.exports = {
  startMonthlyPaymentCron,
};
