const Subscription = require('./Subscription');
const Payment = require('./Payment');

// Define relationships
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', onDelete: 'SET NULL' });
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId' });

module.exports = {
  Subscription,
  Payment,
};
