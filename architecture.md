# Architecture Suggestions

## Overview
This document outlines the architecture for the **Employee Management System (EMS)** built with Node.js + Express (backend), React + Vite (frontend), and SQLite (database).

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite 4                 |
| Routing    | react-router-dom v6               |
| Backend    | Node.js + Express.js              |
| Database   | SQLite (via `better-sqlite3`)     |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs` |
| Testing    | Jest + Supertest                  |

---

## Folder Structure

```
employee-management/
├── backend/
│   ├── app.js                      ← Express server entry point
│   ├── controllers/
│   │   ├── authController.js       ← Login/logout logic
│   │   ├── employeeController.js   ← CRUD operations
│   │   └── dashboardController.js  ← Stats & analytics
│   ├── middleware/
│   │   ├── authMiddleware.js       ← JWT verification
│   │   ├── validateMiddleware.js   ← Input validation
│   │   └── errorHandler.js         ← Centralized error handling
│   ├── models/
│   │   └── employeeModel.js        ← SQLite DB init & helpers
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── employeeRoutes.js
│   └── utils/
│       └── jwtUtils.js             ← JWT generate/verify utilities
├── frontend/                       ← ⚠️  Legacy HTML/CSS/JS — do not add new files here
│   ├── index.html
│   ├── dashboard.html
│   └── employees.html
├── frontend-react/                 ← ✅ Active frontend (React + Vite)
│   ├── vite.config.js              ← Vite config; proxies /api → :3000 in dev
│   ├── index.html
│   ├── dist/                       ← Build output (gitignored); served by Express in prod
│   └── src/
│       ├── main.jsx                ← React entry point
│       ├── App.jsx                 ← BrowserRouter + route definitions
│       ├── auth.js                 ← Token helpers + apiFetch utility
│       ├── index.css               ← Global EMS styles
│       ├── components/
│       │   ├── PrivateRoute.jsx    ← Redirects to /login if no token
│       │   ├── Sidebar.jsx         ← Fixed sidebar with NavLinks + logout
│       │   └── EmployeeModal.jsx   ← Add / edit employee modal form
│       └── pages/
│           ├── Login.jsx           ← Login form → stores token in localStorage
│           ├── Dashboard.jsx       ← Stats cards + animated bar charts
│           └── Employees.jsx       ← CRUD table with filters + badges
├── tests/
│   ├── jwtUtils.test.js
│   ├── middleware.test.js
│   ├── auth.test.js
│   ├── employee.test.js
│   ├── dashboard.test.js
│   └── unit/
│       ├── authController.test.js
│       ├── employeeController.test.js
│       ├── dashboardController.test.js
│       ├── validateMiddleware.test.js
│       ├── errorHandler.test.js
│       └── employeeModel.test.js
├── .env                            ← Environment variables (never commit)
├── .env.example                    ← Template for .env
├── Dockerfile                      ← Multi-stage build (React + Node)
├── docker-compose.yml
└── package.json
```

---

## API Endpoints

| Method   | Endpoint                  | Auth | Description               |
|----------|---------------------------|------|---------------------------|
| `POST`   | `/api/auth/login`         | ❌   | Login, returns JWT token  |
| `POST`   | `/api/auth/logout`        | ❌   | Logout (client-side)      |
| `GET`    | `/api/employees`          | ✅   | List / filter employees   |
| `GET`    | `/api/employees/:id`      | ✅   | Get single employee       |
| `POST`   | `/api/employees`          | ✅   | Create new employee       |
| `PUT`    | `/api/employees/:id`      | ✅   | Update employee           |
| `DELETE` | `/api/employees/:id`      | ✅   | Delete employee           |
| `GET`    | `/api/dashboard/stats`    | ✅   | Dashboard statistics      |

---

## 1. Project Structure
- Separate `backend/` and `frontend/` into distinct folders.
- Use `controllers`, `routes`, and `middleware` for Express.js API organization.
- Place utility functions in a `utils/` directory.
- Store tests in a `tests/` directory mirroring the source structure.

## 2. Authentication
- Use JWT for stateless authentication with an 8-hour token expiry.
- Store secret keys and sensitive config in `.env` environment variables.
- Implement `authMiddleware.js` for all protected `/api/employees` routes.
- Hash passwords using `bcryptjs` before storing in the database.

## 3. Frontend
- React 18 with Vite 4 for fast HMR and optimised production builds.
- `react-router-dom v6` for client-side routing (`/login`, `/dashboard`, `/employees`).
- `PrivateRoute` component guards all authenticated pages; redirects to `/login` if no token.
- Fixed sidebar navigation (`Sidebar.jsx`) with `NavLink` active-class highlighting.
- `apiFetch` utility in `auth.js` centralises all API calls with auth headers and error handling.
- Token and user object stored in `localStorage`; cleared on logout.
- All styles in a single `index.css` using CSS custom classes (no CSS-in-JS).
- Vite dev server proxies `/api` requests to Express on port 3000 (no CORS issues in dev).
- **Ports:** React dev server → `5173`, Express API → `3000`.

## 4. Database
- SQLite via `better-sqlite3` for simple, file-based persistence.
- Single `database.sqlite` file at the project root.
- Tables: `employees`, `users`.
- Migrate to PostgreSQL for production scale.

## 5. Testing
- Use Jest + Supertest for JavaScript API integration tests (39 tests, all passing).
- Unit test each utility function and middleware in isolation.
- `app.js` uses `require.main === module` guard so Supertest can import without starting the server.
- Add CI configuration (GitHub Actions) to automate tests on push/PR.

## 6. Error Handling & Logging
- Centralized error handler middleware returns consistent JSON error responses.
- Use Morgan or Winston for request and error logging in production.

## 7. Security
- Validate and sanitize all user input via `validateMiddleware.js`.
- Use HTTPS in production via a reverse proxy (Nginx).
- Configure CORS to allow only trusted origins.
- Never commit `.env` files or `database.sqlite` to version control.

## 8. Environment Management
- Use a `.env` file for `JWT_SECRET`, `PORT`, and DB path configuration.
- Use `dotenv` to load variables in Node.js.

## 9. Deployment
- Use Docker + `docker-compose` for containerization.
- Serve the frontend via Express's `express.static` or a CDN.
- Use a process manager like PM2 for production Node.js deployment.

---
> Adjust these suggestions based on your project's scale and requirements.