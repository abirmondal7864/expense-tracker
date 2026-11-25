# 💸 Expense Tracker

> A full-stack MERN expense management application with authentication, analytics, filtering, and interactive charts.

[![Live App](https://img.shields.io/badge/Live%20App-Open-success)](https://expense-tracker-xi-blue-21.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://expense-tracker-xi-blue-21.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-purple)](https://expense-tracker-fgcc.onrender.com)

## ✨ Features

- 🔐 JWT-based authentication
- ➕ Add, edit, and delete expenses
- 🗂️ Category-based expense management
- 📊 Dashboard with spending summaries
- 📈 Monthly and category-wise analytics
- 🔍 Search, filter, and sort
- 🔔 Toast notifications
- ⏳ Loading and empty states
- ⚠️ Delete confirmation modal
- ♻️ Reusable React components

## 🧩 Architecture

```text
React + Vite
     │
     ▼
Express REST API
     │
     ▼
MongoDB
     ▲
Mongoose
```

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Axios, Chart.js, CSS |
| Backend | Node.js, Express 5, TypeScript (ES Modules) |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Testing | Vitest, React Testing Library, Supertest |
| Deployment | Vercel, Render |

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Add Expense
![Add Expense](./screenshots/add-expense.png)

### Analytics
![Analytics](./screenshots/analytics.png)

### Search & Filter
![Filter](./screenshots/search-filter.png)

## 💻 Run Locally

### Backend

```bash
git clone https://github.com/abirmondal7864/expense-tracker.git
cd expense-tracker/backend
npm install
```

Create `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run in development:

```bash
npm run dev
```

Build and run in production:

```bash
npm run build
npm start
```

### Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Create `.env`:

```env
VITE_API_URL=your_backend_url
```

## 🧪 Testing & Coverage

Both frontend and backend use **Vitest** with `@vitest/coverage-v8` for automated testing and coverage reporting.

### Frontend Tests

Uses Vitest, React Testing Library, `@testing-library/user-event`, and `jsdom`.

```bash
cd frontend
npm test              # Run all frontend tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with V8 coverage report
npm run typecheck     # Run TypeScript compiler check (tsc --noEmit)
```

Measured frontend test results:
- **Test suites**: 6 files, 25 tests passing
- **Coverage**: 80.37% statements, 64.43% branches, 77.77% functions, 80.73% lines

### Backend Tests

Uses Vitest and Supertest with mocked Mongoose models and email transport (never connects to production MongoDB).

```bash
cd backend
npm test              # Run all backend tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with V8 coverage report
npm run typecheck     # Run TypeScript compiler check (tsc --noEmit)
```

Measured backend test results:
- **Test suites**: 3 files, 33 tests passing
- **Coverage**: 87.2% statements, 71% branches, 93.33% functions, 87.57% lines

## 🎯 What This Project Demonstrates

- Full-stack application architecture
- REST API design and integration
- JWT authentication
- MongoDB data modeling with Mongoose
- Data visualization with Chart.js
- Search, filtering, and CRUD workflows
- Frontend/backend deployment

## 🌱 Future Improvements

- Budget tracking and alerts
- Recurring expenses
- PDF/CSV reports
- Dark mode
- Mobile application

## 🤝 Contributing

Contributions are welcome. Fork the repository and open a pull request.

## 🔗 Links

- **Live:** https://expense-tracker-xi-blue-21.vercel.app
- **Backend:** https://expense-tracker-fgcc.onrender.com
- **GitHub:** https://github.com/abirmondal7864/expense-tracker
