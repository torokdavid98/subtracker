const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: true,  // Allow null so we can keep payment history even after subscription is deleted
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Payment;
