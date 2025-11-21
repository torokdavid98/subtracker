const User = require('./User');
const Subscription = require('./Subscription');
const Payment = require('./Payment');

// Define relationships
User.hasMany(Subscription, { foreignKey: 'userId', onDelete: 'CASCADE' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', onDelete: 'SET NULL' });
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId' });

module.exports = {
  User,
  Subscription,
  Payment,
};
