# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack subscription tracking application that helps users manage and analyze their recurring subscriptions.

**Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
**Backend:** Node.js + Express + Sequelize ORM
**Database:** MariaDB/MySQL

## Development Commands

### Backend
```bash
cd backend
npm run dev    # Start with nodemon (auto-reload)
npm start      # Production start
```
Backend runs on `http://localhost:3001`

### Frontend
```bash
cd frontend
npm run dev      # Start Vite dev server (HMR enabled)
npm run build    # Build for production (TypeScript check + build)
npm run lint     # Run ESLint
npm run preview  # Preview production build
```
Frontend runs on `http://localhost:5173`

### Development Setup
1. Ensure MariaDB is running
2. Create database: `CREATE DATABASE subtracker_2025;`
3. Configure `backend/.env` with database credentials
4. Start backend first (Sequelize auto-syncs tables)
5. Start frontend in separate terminal

## Architecture

### Backend Architecture (`backend/`)

**Single-file structure:** The backend uses a minimal two-file architecture for simplicity:
- `database.js`: Sequelize instance, models (Subscription, Payment), and DB sync
- `index.js`: Express server, all API routes, and cron job

**Key patterns:**
- **Soft deletes:** Subscriptions use manual soft delete via `deletedAt` field (not Sequelize paranoid mode)
- **Payment backfilling:** When creating/updating subscriptions, the system automatically backfills Payment records from `startDate` to current month
- **Cron job:** Monthly payment automation runs at midnight on the 1st of each month (`0 0 1 * *`)
- **Analytics calculation:** Real-time calculation from Payment history for monthly spending charts

**Models:**
- `Subscription`: id (UUID), name, cost, billingCycle, startDate, category, description, deletedAt
- `Payment`: id (UUID), subscriptionId (nullable for orphaned payments), amount, paymentDate

**Important behavior:**
- Updating subscription cost/billingCycle/startDate triggers payment recalculation (deletes old payments, backfills new)
- Deleted subscriptions retain Payment history (foreign key uses SET NULL)
- Analytics only counts active (non-deleted) subscriptions but includes all payment history

### Frontend Architecture (`frontend/src/`)

**Component structure:**
- `App.tsx`: Main container with state management, data fetching, tab navigation, and filters
- `components/SubscriptionList.tsx`: Displays subscription cards with edit/delete actions
- `components/SubscriptionForm.tsx`: Form for create/edit (uses react-hook-form + zod)
- `components/Analytics.tsx`: Charts and statistics (Chart.js via react-chartjs-2)
- `components/ui/`: shadcn/ui component library

**State management:**
- All state lives in App.tsx (no Redux/Context)
- Simple props drilling to child components
- Fetches data on mount and after mutations

**Key features:**
- Search, filter (billing cycle, category), and sort subscriptions
- Toggle to show/hide soft-deleted subscriptions
- Toast notifications via shadcn/ui
- Form validation with Zod schemas

**Type definitions:** `types/subscription.ts` defines Subscription and Analytics types matching backend schema

**Styling:** Tailwind CSS with shadcn/ui "new-york" style, uses CSS variables for theming

## API Endpoints

**Subscriptions:**
- `GET /api/subscriptions?includeDeleted=true` - Get all (optionally include soft-deleted)
- `GET /api/subscriptions/:id` - Get one
- `POST /api/subscriptions` - Create (auto-backfills payments)
- `PUT /api/subscriptions/:id` - Update (recalculates payments if cost/cycle/date changed)
- `DELETE /api/subscriptions/:id` - Soft delete (sets deletedAt)

**Payments:**
- `GET /api/payments` - Get all payment history
- `POST /api/payments` - Manual payment record (rarely used, cron handles auto-payments)

**Analytics:**
- `GET /api/analytics` - Returns monthly/yearly totals, category breakdown, monthly spending array

## Database Management

Sequelize automatically syncs schema on server start. To reset database:
```bash
mysql -u root -p
DROP DATABASE subtracker_2025;
CREATE DATABASE subtracker_2025;
EXIT;
# Restart backend to re-sync tables
```

**Environment variables** (backend/.env):
```
DB_NAME=subtracker_2025
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_PORT=3306
PORT=3001
```

## Important Notes

- Payment backfilling normalizes all dates to the 1st of each month
- Monthly subscriptions create payments every month; yearly subscriptions only on anniversary month
- The cron job only charges active (non-deleted) subscriptions
- Frontend hardcodes API URL to `http://localhost:3001/api` (no environment variables)
- shadcn/ui components use path aliases (@/components, @/lib, @/hooks)
