# Subscription Tracker

A full-stack web application to track your subscriptions and visualize spending with analytics.

## Features

- Track monthly and yearly subscriptions
- Calculate total spending (monthly and yearly)
- Categorize subscriptions
- Analytics dashboard with charts
- Responsive design with Tailwind CSS

## Tech Stack

**Frontend:**
- React with Vite
- Tailwind CSS
- Chart.js with react-chartjs-2

**Backend:**
- Node.js with Express
- Sequelize ORM
- MariaDB database

## Prerequisites

- Node.js (v16 or higher)
- MariaDB database

## Setup Instructions

### 1. Database Setup

First, ensure you have MariaDB installed and running. Create a database for the application:

```bash
# Connect to MariaDB
mysql -u root -p

# Create database
CREATE DATABASE subtracker;
EXIT;
```

Or connect to an existing MariaDB instance and update the connection string in `backend/.env`.

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Update the database credentials in .env
# Edit the file and set your MariaDB username, password, and database name:
# DB_NAME=subtracker_2025
# DB_USER=your_username
# DB_PASS=your_password
# DB_HOST=localhost
# DB_PORT=3306

# Start the backend server
npm run dev
```

**Note:** Sequelize will automatically create the necessary tables when the server starts.

The backend will run on http://localhost:3001

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the development server
npm run dev
```

The frontend will run on http://localhost:5173 (or the next available port)

## Usage

1. Open your browser and navigate to the frontend URL (usually http://localhost:5173)
2. Click "Add Subscription" to create a new subscription
3. Fill in the details:
   - Name (e.g., Netflix, Spotify)
   - Cost
   - Billing cycle (monthly or yearly)
   - Next bill date
   - Category (optional)
   - Description (optional)
4. View all your subscriptions in the Subscriptions tab
5. Check the Analytics tab to see:
   - Total number of subscriptions
   - Monthly and yearly spending totals
   - Cost breakdown by category (pie chart)
   - Monthly vs yearly comparison (bar chart)

## API Endpoints

- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get a specific subscription
- `POST /api/subscriptions` - Create a new subscription
- `PUT /api/subscriptions/:id` - Update a subscription
- `DELETE /api/subscriptions/:id` - Delete a subscription
- `GET /api/analytics` - Get analytics data

## Database Schema

The Subscription model (defined in `backend/database.js`):

```javascript
{
  id: UUID (Primary Key)
  name: String (Required)
  cost: Float (Required)
  billingCycle: String (Required) // "monthly" or "yearly"
  nextBillDate: Date (Required)
  description: Text (Optional)
  category: String (Optional)
  createdAt: Date (Auto-generated)
  updatedAt: Date (Auto-generated)
}
```

## Development

### Backend
```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend
```bash
cd frontend
npm run dev  # Runs Vite dev server with HMR
```

### Database Management

Sequelize automatically syncs the database schema when the server starts. To reset or modify the database:

1. Update the model in `backend/database.js`
2. Restart the backend server
3. For a fresh start, drop and recreate the database in MariaDB

## Project Structure

```
subtracker/
├── backend/
│   ├── database.js       # Sequelize models and config
│   ├── index.js          # Express server and API routes
│   ├── package.json
│   └── .env             # Database credentials
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analytics.jsx
│   │   │   ├── SubscriptionForm.jsx
│   │   │   └── SubscriptionList.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```
