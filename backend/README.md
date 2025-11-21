# Backend API

Node.js + Express backend for the Subscription Tracker application.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Sequelize configuration and connection
│   ├── models/
│   │   ├── Subscription.js      # Subscription model definition
│   │   ├── Payment.js           # Payment model definition
│   │   └── index.js             # Model relationships
│   ├── controllers/
│   │   ├── subscriptionController.js  # Subscription CRUD logic
│   │   ├── paymentController.js       # Payment CRUD logic
│   │   └── analyticsController.js     # Analytics calculations
│   ├── routes/
│   │   ├── subscriptionRoutes.js      # Subscription endpoints
│   │   ├── paymentRoutes.js           # Payment endpoints
│   │   ├── analyticsRoutes.js         # Analytics endpoints
│   │   └── index.js                   # Route aggregation
│   ├── services/
│   │   ├── paymentService.js          # Payment backfilling logic
│   │   └── cronService.js             # Monthly payment cron job
│   └── index.js                        # Express app entry point
├── .env                                # Environment variables
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- MariaDB or MySQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
DB_NAME=subtracker_2025
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_PORT=3306
PORT=3001
```

3. Ensure database exists:
```bash
mysql -u root -p
CREATE DATABASE subtracker_2025;
EXIT;
```

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs on `http://localhost:3001`

## API Endpoints

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions (query param: `?includeDeleted=true`)
- `GET /api/subscriptions/:id` - Get single subscription
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Soft delete subscription

### Payments
- `GET /api/payments` - Get all payment history
- `POST /api/payments` - Create manual payment record

### Analytics
- `GET /api/analytics` - Get analytics data (totals, category breakdown, monthly spending)

## Key Features

### Soft Delete
Subscriptions use manual soft delete via `deletedAt` timestamp. Deleted subscriptions retain their payment history.

### Payment Backfilling
When creating or updating subscriptions, the system automatically generates payment records from the subscription's start date to the current month.

### Automated Monthly Payments
A cron job runs at midnight on the 1st of each month to automatically create payment records for active subscriptions.

## Database Models

### Subscription
- id (UUID)
- name (String)
- cost (Float)
- billingCycle ('monthly' | 'yearly')
- startDate (Date)
- category (String, optional)
- description (Text, optional)
- deletedAt (Date, nullable)

### Payment
- id (UUID)
- subscriptionId (UUID, nullable)
- amount (Float)
- paymentDate (Date)

Relationship: Payment belongs to Subscription (SET NULL on delete to preserve history)

## Architecture Flow

```
Request Flow:
Client → routes/index.js → specific route file → controller → model/service → database

Example: Create Subscription
POST /api/subscriptions
  → routes/index.js (mounts /subscriptions)
  → routes/subscriptionRoutes.js
  → controllers/subscriptionController.createSubscription()
  → models/Subscription.create()
  → services/paymentService.backfillPayments()
  → database
```

## Adding New Features

### Adding a new endpoint:
1. Create controller function in `controllers/`
2. Add route in appropriate `routes/` file
3. (Optional) Create service function if reusable logic needed

### Adding a new model:
1. Create model file in `models/`
2. Define relationships in `models/index.js`
3. Export from `models/index.js`
