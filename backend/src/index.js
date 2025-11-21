const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { syncDatabase } = require('./config/database');
const { startMonthlyPaymentCron } = require('./services/cronService');
const routes = require('./routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
syncDatabase();

// Initialize cron jobs
startMonthlyPaymentCron();

// API routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  process.exit(0);
});
