# EMS — Step-by-Step Development Plan for Coding Agents

> Based on `architecture.md`. Each step is scoped to a **single, independently testable unit**.
> Agents should complete, verify, and test each step before moving to the next.
>
> **Last updated:** 13 March 2026
> **Status Legend:** ✅ Complete · 🔄 In Progress · ⬜ Pending

---

## 📊 Overall Progress

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project Scaffolding | ✅ Complete |
| 2 | Database Layer | ✅ Complete |
| 3 | Auth Utilities | ✅ Complete |
| 4 | Middleware | ✅ Complete |
| 5 | Controllers | ✅ Complete |
| 6 | Routes | ✅ Complete |
| 7 | Express App Assembly | ✅ Complete |
| 8 | Frontend Pages | ✅ Complete |
| 9 | Testing Suite | ✅ Complete |
| 10 | Hardening & Deployment | ✅ Complete |

---

## 📐 Granularity Guidelines

| Unit Size | Rule |
|-----------|------|
| **One function = one responsibility** | e.g., `generateToken()` and `verifyToken()` are separate functions |
| **One file = one concern** | e.g., validation middleware is separate from auth middleware |
| **One step = one testable output** | Every step should have a clear "done" criteria and a test |
| **Bottom-up order** | Build utilities → models → middleware → controllers → routes → frontend |

---

## ✅ Phase 1 — Project Scaffolding

### ✅ Step 1.1 — Initialize project
- Folder structure created: `backend/`, `frontend/assets/`, `tests/`
- `npm init` completed, `package.json` in place
- Dependencies installed: `express`, `better-sqlite3`, `jsonwebtoken`, `bcryptjs`, `cors`
- Dev dependencies installed: `jest`, `supertest`
- `.gitignore` configured for `node_modules/`, `.env`, `database.sqlite`

**✅ Done:** Server starts on `http://localhost:3000`

---

## ✅ Phase 2 — Database Layer

### ✅ Step 2.1 — Implement `getDB()` helper
- File: `backend/models/employeeModel.js`
- `getDB()` opens and returns a `better-sqlite3` connection

### ✅ Step 2.2 — Implement `initDB()`
- Creates `employees` and `users` tables if not exists
- Seeds default admin user (`admin` / `admin123` hashed with bcrypt)
- `database.sqlite` is present at project root

**✅ Done:** DB initialised on server start

---

## ✅ Phase 3 — Auth Utilities

### ✅ Step 3.1 — Implement `generateToken(payload)`
- File: `backend/utils/jwtUtils.js`
- Signs payload with `JWT_SECRET`, expires in 8h

### ✅ Step 3.2 — Implement `verifyToken(token)`
- Verifies and decodes a JWT; throws on invalid/expired token

**✅ Done:** Both functions exported and used in middleware

---

## ✅ Phase 4 — Middleware

### ✅ Step 4.1 — `authMiddleware`
- File: `backend/middleware/authMiddleware.js`
- Reads `Authorization: Bearer <token>`, verifies, attaches `req.user`
- Returns `401` if no token, `403` if invalid

### ✅ Step 4.2 — `validateEmployee`
- File: `backend/middleware/validateMiddleware.js`
- Validates all 6 fields: `name`, `email`, `department`, `role`, `hireDate`, `salary`
- Returns `400` with array of error messages

### ✅ Step 4.3 — `errorHandler`
- File: `backend/middleware/errorHandler.js`
- Centralized error handler, returns `{ message }` JSON

**✅ Done:** All middleware wired in `app.js`

---

## ✅ Phase 5 — Controllers

### ✅ Step 5.1 — `authController.login()`
- File: `backend/controllers/authController.js`
- Validates credentials, returns JWT on success, `401` on failure

### ✅ Step 5.2 — `authController.logout()`
- Returns `{ message: 'Logged out successfully' }`

### ✅ Step 5.3 — `employeeController.getAllEmployees()`
- File: `backend/controllers/employeeController.js`
- Supports `?department=` and `?role=` query filters

### ✅ Step 5.4 — `employeeController.getEmployeeById()`
- Returns single employee or `404`

### ✅ Step 5.5 — `employeeController.createEmployee()`
- Inserts employee, returns `201`; `409` on duplicate email

### ✅ Step 5.6 — `employeeController.updateEmployee()`
- Updates by ID, returns updated record or `404`

### ✅ Step 5.7 — `employeeController.deleteEmployee()`
- Deletes by ID, returns success message or `404`

### ✅ Step 5.8 — `dashboardController.getStats()`
- File: `backend/controllers/dashboardController.js`
- Returns `total`, `byDepartment[]`, `byRole[]`, `avgSalary`

**✅ Done:** All controllers implemented and reachable via API

---

## ✅ Phase 6 — Routes

### ✅ Step 6.1 — `authRoutes`
- `POST /api/auth/login` and `POST /api/auth/logout` wired

### ✅ Step 6.2 — `employeeRoutes`
- All 5 CRUD endpoints + filter
- `authMiddleware` applied to all routes
- `validateEmployee` applied to `POST` and `PUT`

**✅ Done:** All routes mounted in `app.js`

---

## ✅ Phase 7 — Express App Assembly

### ✅ Step 7.1 — `app.js`
- `cors`, `express.json()`, `express.static('../frontend')` registered
- All routers mounted
- `errorHandler` registered last
- `initDB()` called before `app.listen()`

**✅ Done:** Server running at `http://localhost:3000`

---

## ✅ Phase 8 — Frontend Pages

### ✅ Step 8.1 — Login page (`frontend/index.html`)
- Gradient background, logo, clean card layout
- `POST /api/auth/login` on submit, token saved to `localStorage`
- Inline error messages on failure

### ✅ Step 8.2 — Shared JS helpers (`frontend/assets/app.js`)
- `getToken()`, `authHeaders()`, `requireAuth()`, logout wiring

### ✅ Step 8.3 — Dashboard page (`frontend/dashboard.html`)
- Sidebar navigation, 4 stat cards with color icons
- Animated bar charts for department and role breakdowns

### ✅ Step 8.4 — Employees page (`frontend/employees.html`)
- Responsive table with color-coded department/role badges
- Filter bar for department and role
- Add/Edit modal form with 2-column grid
- Delete with confirmation dialog

**✅ Done:** Full UI running and connected to API

---

## ✅ Phase 9 — Testing Suite

> **Status: Complete** — 103 tests passing across 11 test files (64 unit + 39 integration).

### ✅ Step 9.1 — Unit tests: `jwtUtils`
- File: `tests/jwtUtils.test.js` — 5 tests ✅

### ✅ Step 9.2 — Unit tests: middleware
- File: `tests/middleware.test.js` — 10 tests ✅

### ✅ Step 9.3 — Integration tests: auth routes
- File: `tests/auth.test.js` — 5 tests ✅

### ✅ Step 9.4 — Integration tests: employee routes
- File: `tests/employee.test.js` — 14 tests ✅

### ✅ Step 9.5 — Integration tests: dashboard
- File: `tests/dashboard.test.js` — 5 tests ✅

### ✅ Step 9.6 — Unit tests: controllers (mocked DB)
- `tests/unit/authController.test.js` — 8 tests ✅
- `tests/unit/employeeController.test.js` — 17 tests ✅
- `tests/unit/dashboardController.test.js` — 7 tests ✅

### ✅ Step 9.7 — Unit tests: middleware edge cases
- `tests/unit/validateMiddleware.test.js` — 10 tests ✅

### ✅ Step 9.8 — Unit tests: errorHandler
- `tests/unit/errorHandler.test.js` — 5 tests ✅

### ✅ Step 9.9 — Unit tests: employeeModel
- `tests/unit/employeeModel.test.js` — 8 tests ✅

**✅ Done:** `npx jest --testPathPattern=tests/ --runInBand --forceExit` → 39/39 passed

---

## ✅ Phase 10 — Hardening & Deployment Prep

### ✅ Step 10.1 — Security hardening
- Added `helmet` for HTTP security headers
- Restricted CORS to `ALLOWED_ORIGIN` from `.env`
- Added `express-rate-limit` on `POST /api/auth/login` (20 req / 15 min)

### ✅ Step 10.2 — Logging
- Added `morgan` (`dev` format in development, `combined` in production)
- `errorHandler` logs full stack trace in development; ISO timestamp only in production

### ✅ Step 10.3 — Environment config
- `dotenv` loaded at top of `app.js` from `employee-management/.env`
- `.env.example` documents all 4 required variables (`PORT`, `JWT_SECRET`, `ALLOWED_ORIGIN`, `NODE_ENV`)
- `README.md` updated with env vars table, quick-start instructions, and Docker instructions
- `.gitignore` updated to exclude `.env`, `database.sqlite`, `dist/`

### ✅ Step 10.4 — Docker
- `Dockerfile` — multi-stage build: React frontend built in Stage 1, served statically by Express in Stage 2
- `docker-compose.yml` — single `app` service, SQLite persisted via named volume, env vars injected
- `docker compose up --build` starts the complete app at `http://localhost:3000`

**✅ Done:** 39/39 tests still passing after all hardening changes

---

## 🗂 Recommended Implementation Order

```
jwtUtils → employeeModel → middleware → controllers → routes → app.js → frontend → tests → hardening
```

Each item must have a passing test before the next item begins.

---

## 📋 Definition of Done (per step)
- [ ] Code written and follows single-responsibility principle
- [ ] Unit or integration test written and passing
- [ ] No linting errors
- [ ] Function/module exported correctly for use by dependents
- [ ] Edge cases handled (missing input, not found, duplicates)

---

## Phase 1 — Project Scaffolding

### Step 1.1 — Initialize project
- Create folder structure: `backend/`, `frontend/assets/`, `tests/`
- Run `npm init -y`
- Install dependencies: `express`, `better-sqlite3`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`
- Install dev dependencies: `jest`, `supertest`
- Add `.env` with `PORT=3000` and `JWT_SECRET=changeme`
- Add `.gitignore` with `node_modules/`, `.env`, `database.sqlite`

**✅ Done when:** `node -e "require('./backend/app.js')"` runs without errors.

---

## Phase 2 — Database Layer

### Step 2.1 — Implement `getDB()` helper
- File: `backend/models/employeeModel.js`
- Function: `getDB()` — opens and returns a `better-sqlite3` connection
- Granularity: **single exported function**

**✅ Test:** Call `getDB()` and assert it returns a database instance.

### Step 2.2 — Implement `initDB()`
- Function: `initDB()` — creates `employees` and `users` tables if not exists
- Seeds one default admin user (`admin` / `admin123` hashed with bcrypt)
- Granularity: **single exported function**

**✅ Test:** Run `initDB()` twice (idempotent), assert tables exist, assert admin user exists.

---

## Phase 3 — Auth Utilities

### Step 3.1 — Implement `generateToken(payload)`
- File: `backend/utils/jwtUtils.js`
- Signs payload with `JWT_SECRET`, expires in 8h
- Granularity: **one pure function**

**✅ Test:** `generateToken({ id: 1 })` returns a non-empty string.

### Step 3.2 — Implement `verifyToken(token)`
- Verifies and decodes a JWT string
- Throws on invalid/expired token
- Granularity: **one pure function**

**✅ Test:** `verifyToken(generateToken({ id: 1 }))` returns `{ id: 1 }`. Invalid token throws.

---

## Phase 4 — Middleware

### Step 4.1 — Implement `authMiddleware`
- File: `backend/middleware/authMiddleware.js`
- Reads `Authorization: Bearer <token>` header
- Calls `verifyToken()`, attaches `req.user` on success
- Returns `401` if no token, `403` if invalid
- Granularity: **one middleware function**

**✅ Test:** Mock `req/res/next`, assert `next()` called with valid token; assert `403` with bad token.

### Step 4.2 — Implement `validateEmployee`
- File: `backend/middleware/validateMiddleware.js`
- Validates: `name`, `email` (regex), `department`, `role`, `hireDate` (valid date), `salary` (≥ 0)
- Returns `400` with array of error messages on failure
- Granularity: **one middleware function, validates all fields in one pass**

**✅ Test:** Send body missing each field individually, assert correct error messages returned.

### Step 4.3 — Implement `errorHandler`
- File: `backend/middleware/errorHandler.js`
- Catches errors passed via `next(err)`, returns `{ message }` JSON
- Granularity: **one middleware function**

**✅ Test:** Pass an error with `status: 404`, assert response is `404` with correct message.

---

## Phase 5 — Controllers

### Step 5.1 — Implement `authController.login()`
- File: `backend/controllers/authController.js`
- Reads `username` + `password` from body
- Queries `users` table, compares password with `bcrypt.compareSync()`
- Returns JWT on success, `401` on failure
- Granularity: **one controller function**

**✅ Test (integration):** `POST /api/auth/login` with valid credentials → `200 + token`. Invalid → `401`.

### Step 5.2 — Implement `authController.logout()`
- Returns `{ message: 'Logged out' }` (JWT is stateless; client discards token)
- Granularity: **one controller function**

**✅ Test:** `POST /api/auth/logout` → `200`.

### Step 5.3 — Implement `employeeController.getAllEmployees()`
- File: `backend/controllers/employeeController.js`
- Supports optional `?department=` and `?role=` query filters
- Returns array of employees
- Granularity: **one function, filters applied in a single query**

**✅ Test:** Seed 3 employees, assert all returned. Filter by dept, assert correct subset returned.

### Step 5.4 — Implement `employeeController.getEmployeeById()`
- Returns single employee by `req.params.id`
- Returns `404` if not found
- Granularity: **one function**

**✅ Test:** Existing ID → employee object. Non-existing ID → `404`.

### Step 5.5 — Implement `employeeController.createEmployee()`
- Inserts new employee, returns `201` with created record
- Returns `409` on duplicate email
- Granularity: **one function**

**✅ Test:** Create employee → `201`. Duplicate email → `409`.

### Step 5.6 — Implement `employeeController.updateEmployee()`
- Updates employee by ID, returns updated record
- Returns `404` if not found
- Granularity: **one function**

**✅ Test:** Update existing → `200`. Update non-existing → `404`.

### Step 5.7 — Implement `employeeController.deleteEmployee()`
- Deletes employee by ID, returns `{ message: 'Employee deleted' }`
- Returns `404` if not found
- Granularity: **one function**

**✅ Test:** Delete existing → `200`. Delete non-existing → `404`.

### Step 5.8 — Implement `dashboardController.getStats()`
- File: `backend/controllers/dashboardController.js`
- Returns: `total`, `byDepartment[]`, `byRole[]`, `avgSalary`
- Granularity: **one function, all stats in a single DB call set**

**✅ Test:** Seed employees → assert `total` matches count, `avgSalary` is correct.

---

## Phase 6 — Routes

### Step 6.1 — Implement `authRoutes`
- File: `backend/routes/authRoutes.js`
- `POST /api/auth/login` → `authController.login`
- `POST /api/auth/logout` → `authController.logout`

**✅ Test:** Route resolves to correct controller (integration test).

### Step 6.2 — Implement `employeeRoutes`
- File: `backend/routes/employeeRoutes.js`
- Apply `authMiddleware` to all routes
- Apply `validateEmployee` to `POST` and `PUT`
- Wire all 5 CRUD endpoints + filter

**✅ Test:** Unauthenticated request → `401`. Authenticated CRUD → correct responses.

---

## Phase 7 — Express App Assembly

### Step 7.1 — Assemble `app.js`
- Register `cors`, `express.json()`, `express.static('../frontend')`
- Mount `/api/auth` and `/api/employees` routers
- Mount `GET /api/dashboard/stats`
- Register `errorHandler` last
- Call `initDB()` before `app.listen()`

**✅ Test:** Server starts, `GET /` serves `index.html`, `GET /api/auth/login` is reachable.

---

## Phase 8 — Frontend Pages

### Step 8.1 — Login page (`index.html`)
- Form: `username` + `password`
- On submit: `POST /api/auth/login`, store token in `localStorage`
- On success: redirect to `dashboard.html`
- On error: show inline error message

**✅ Done when:** Login with `admin/admin123` redirects to dashboard.

### Step 8.2 — Shared JS helpers (`assets/app.js`)
- `getToken()` — reads from `localStorage`
- `authHeaders()` — returns `{ Authorization: Bearer <token> }`
- `requireAuth()` — redirects to login if no token
- Logout button wires to `localStorage.clear()` + redirect

**✅ Done when:** Navigating to dashboard without token redirects to login.

### Step 8.3 — Dashboard page (`dashboard.html`)
- Calls `GET /api/dashboard/stats`
- Renders: total, avg salary, dept count, role count
- Renders animated bar charts for dept and role breakdowns

**✅ Done when:** Stats render correctly after seeding employees.

### Step 8.4 — Employees page (`employees.html`)
- Table renders all employees from `GET /api/employees`
- Filter inputs call `loadEmployees()` with query params
- Add button opens modal form → `POST /api/employees`
- Edit button populates modal → `PUT /api/employees/:id`
- Delete button → `DELETE /api/employees/:id` with confirmation

**✅ Done when:** Full CRUD works end-to-end in the browser.

---

## Phase 9 — Testing Suite

### Step 9.1 — Unit tests: `jwtUtils`
- `generateToken` and `verifyToken` happy/error paths

### Step 9.2 — Unit tests: middleware
- `authMiddleware` — valid token, missing token, invalid token
- `validateEmployee` — each validation rule individually

### Step 9.3 — Integration tests: auth routes
- `POST /api/auth/login` — valid, invalid credentials

### Step 9.4 — Integration tests: employee routes
- All 5 CRUD endpoints with valid auth
- Filter by `department` and `role`
- Unauthenticated requests return `401`

### Step 9.5 — Integration tests: dashboard
- `GET /api/dashboard/stats` returns correct shape

**✅ Done when:** `npx jest --coverage` passes with ≥ 80% coverage.

---

## Phase 10 — Hardening & Deployment Prep

### Step 10.1 — Security
- Add `helmet` middleware for HTTP security headers
- Restrict CORS to specific origin(s) via `.env`
- Add rate limiting on `/api/auth/login` (e.g., `express-rate-limit`)

### Step 10.2 — Logging
- Add `morgan` for HTTP request logging
- Log errors to console with stack trace in development

### Step 10.3 — Environment config
- Load all config from `.env` using `dotenv`
- Document all required env vars in `README.md`

### Step 10.4 — Docker
- Create `Dockerfile` for the Node.js app
- Create `docker-compose.yml` with app service
- Verify `docker compose up` starts the server correctly

---

## 🗂 Recommended Implementation Order

```
jwtUtils → employeeModel → middleware → controllers → routes → app.js → frontend → tests → hardening
```

Each item must have a passing test before the next item begins.

---

## 📋 Definition of Done (per step)
- [ ] Code written and follows single-responsibility principle
- [ ] Unit or integration test written and passing
- [ ] No linting errors
- [ ] Function/module exported correctly for use by dependents
- [ ] Edge cases handled (missing input, not found, duplicates)
