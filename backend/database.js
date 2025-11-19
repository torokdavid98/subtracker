const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    // pool: {
    //   max: parseInt(process.env.DB_MAXCONNECTION) || 5,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000,
    // },
    logging: false,
  }
);

// Define Subscription model
const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cost: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  billingCycle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  paranoid: false, // We'll handle soft delete manually
});

// Define Payment model to track payment history
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

// Define relationships
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', onDelete: 'SET NULL' });

// Sync database
async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    await sequelize.sync();
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

module.exports = {
  sequelize,
  Subscription,
  Payment,
  syncDatabase,
};
