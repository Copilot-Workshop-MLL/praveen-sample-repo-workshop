# Employee Management System

A full-stack Employee Management System built with **Node.js + Express** (backend), **React + Vite** (frontend), and **SQLite** (database).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies

```bash
cd employee-management
npm install

cd frontend-react
npm install
```

### 2. Configure environment

```bash
cd employee-management
cp .env.example .env
# Edit .env and set JWT_SECRET to a long random string
```

### 3. Start the backend

```bash
cd employee-management
node backend/app.js
# → http://localhost:3000
```

### 4. Start the React frontend (development)

```bash
cd employee-management/frontend-react
npm run dev
# → http://localhost:5173
```

### Default login credentials

| Username | Password |
|----------|----------|
| `admin`  | `admin123` |

---

## 🧪 Running Tests

All tests live under `employee-management/tests/`.

```bash
cd employee-management
```

### Run all tests (unit + integration)

```bash
npm test
```

### Run unit tests only (no server needed, instant feedback)

```bash
npm run test:unit
```

Unit tests are isolated — they mock the database and all external dependencies. No running server or SQLite file required.

| Test file | What it covers |
|---|---|
| `tests/unit/authController.test.js` | `login()` and `logout()` with mocked DB & bcrypt |
| `tests/unit/employeeController.test.js` | All 5 CRUD functions with mocked DB |
| `tests/unit/dashboardController.test.js` | `getStats()` — totals, averages, groupings |
| `tests/unit/validateMiddleware.test.js` | All field rules + boundary/edge cases |
| `tests/unit/errorHandler.test.js` | Status codes, default messages, dev logging |
| `tests/unit/employeeModel.test.js` | `getDB()` and `initDB()` against a temp SQLite file |

### Run integration tests only (requires no running server — Supertest handles it)

```bash
npm run test:integration
```

| Test file | What it covers |
|---|---|
| `tests/jwtUtils.test.js` | `generateToken` / `verifyToken` happy & error paths |
| `tests/middleware.test.js` | `authMiddleware` + `validateEmployee` via mock req/res |
| `tests/auth.test.js` | `POST /api/auth/login` and `/logout` via HTTP |
| `tests/employee.test.js` | Full CRUD + filters + auth guard via HTTP |
| `tests/dashboard.test.js` | `GET /api/dashboard/stats` response shape via HTTP |

### Run all tests with coverage report

```bash
npm run test:coverage
```

Coverage output is printed to the terminal. Aim for ≥ 80% across all files.

---

## 🐳 Docker

```bash
cd employee-management
docker compose up --build
# App + built frontend served at http://localhost:3000
```

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Port the Express server listens on |
| `JWT_SECRET` | **Yes** | — | Secret used to sign JWT tokens |
| `ALLOWED_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `NODE_ENV` | No | `development` | Set to `production` in prod |

See `.env.example` for a template.

---

## 📁 Project Structure

```
employee-management/
├── backend/          ← Express API (controllers, middleware, models, routes, utils)
├── frontend/         ← Legacy HTML/CSS/JS (superseded)
├── frontend-react/   ← React + Vite frontend (active)
├── tests/            ← Jest + Supertest test suite (39 tests)
├── .env.example      ← Environment variable template
├── Dockerfile
└── docker-compose.yml
```

---

## 📜 License

MIT
