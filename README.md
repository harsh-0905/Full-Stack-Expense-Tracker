# SpendLens — Production Expense Tracker

Full-stack expense tracking app built with React + Node.js + MongoDB.

## 🗂 Project Structure

```
expense-tracker-pro/
├── backend/          ← Node.js + Express REST API
└── frontend/         ← React + Vite + Tailwind SPA
```

---

## ⚡ Quick Start (Local)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # Fill in MONGO_URI and JWT_SECRET
npm run dev            # Starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Set VITE_API_URL (or leave empty for proxy)
npm run dev            # Starts on http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:5000` automatically.

---

## 🔑 Environment Variables

### Backend `.env`
| Variable         | Description                              |
|-----------------|------------------------------------------|
| `NODE_ENV`      | `development` or `production`            |
| `PORT`          | Server port (default 5000)               |
| `MONGO_URI`     | MongoDB Atlas connection string          |
| `JWT_SECRET`    | Secret key ≥ 32 chars                    |
| `JWT_EXPIRES_IN`| Token expiry e.g. `7d`                  |
| `FRONTEND_URL`  | Frontend origin for CORS                 |

### Frontend `.env`
| Variable         | Description                              |
|-----------------|------------------------------------------|
| `VITE_API_URL`  | Backend API base URL (deployed)          |

---

## 🚀 Deployment

### Backend → Render

1. Push code to GitHub (exclude `node_modules`).
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add all environment variables from `.env.example`.
5. Deploy. Copy the deployed URL (e.g. `https://my-api.onrender.com`).

### Frontend → Vercel

1. Push frontend code to GitHub.
2. Import project on [vercel.com](https://vercel.com).
3. Set `VITE_API_URL=https://my-api.onrender.com/api` in Vercel environment variables.
4. Build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.

---

## 📡 API Reference

### Auth
| Method | Route              | Body / Params              |
|--------|--------------------|----------------------------|
| POST   | /api/auth/register | `{name, email, password}`  |
| POST   | /api/auth/login    | `{email, password}`        |
| GET    | /api/auth/me       | Bearer token               |
| PATCH  | /api/auth/profile  | `{name?, monthlyBudget?, currency?}` |

### Expenses (all require Bearer token)
| Method | Route                       | Notes                                  |
|--------|-----------------------------|----------------------------------------|
| GET    | /api/expenses               | `?page&limit&search&category&startDate&endDate&minAmount&maxAmount&sortBy&order` |
| POST   | /api/expenses               | `{title, amount, category, date, paymentMethod, note}` |
| GET    | /api/expenses/:id           |                                        |
| PUT    | /api/expenses/:id           | Full update                            |
| PATCH  | /api/expenses/:id           | Partial update                         |
| DELETE | /api/expenses/:id           |                                        |
| POST   | /api/expenses/bulk-delete   | `{ids: [...]}`                         |
| GET    | /api/expenses/categories    | Returns valid categories               |

### Analytics (all require Bearer token)
| Method | Route                            | Query Params     |
|--------|----------------------------------|------------------|
| GET    | /api/analytics/dashboard         | `?period=month`  |
| GET    | /api/analytics/summary           | `?period`        |
| GET    | /api/analytics/categories        | `?period`        |
| GET    | /api/analytics/trend             | `?period`        |
| GET    | /api/analytics/comparison        |                  |
| GET    | /api/analytics/top               | `?limit=5`       |
| GET    | /api/analytics/payment-methods   | `?period`        |

---

## 🛡 Security Features

- JWT authentication on all private routes
- Bcrypt password hashing (salt rounds: 12)
- Helmet HTTP security headers
- express-mongo-sanitize (NoSQL injection prevention)
- Rate limiting: 200 req/15min global, 20 req/15min on auth routes
- Strict CORS (only allow configured frontend URL)
- Zod validation on all POST/PUT/PATCH bodies
- Input truncation via schema `maxlength`

---

## 🏗 Tech Stack

**Backend:** Node.js, Express 4, Mongoose, MongoDB Atlas, JWT, bcryptjs, Zod, Helmet, express-rate-limit

**Frontend:** React 18, Vite, Tailwind CSS, React Query v5, Axios, Chart.js, react-chartjs-2, React Router v6, date-fns, react-hot-toast, Lucide React

---

Built by **Harsh Yadav** · [GitHub](https://github.com/harsh-0905) · [Portfolio](https://portfolio-7ivq.vercel.app)
