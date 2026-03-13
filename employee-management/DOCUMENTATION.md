# Employee Management System — Application Documentation

> **Last updated:** 13 March 2026
> **Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Summary](#architecture-summary)
3. [User Flow](#user-flow)
4. [Page & Feature Reference](#page--feature-reference)
5. [API Reference](#api-reference)
6. [Sequence Diagrams](#sequence-diagrams)
   - [Login](#1-login-flow)
   - [View Dashboard](#2-view-dashboard)
   - [Create Employee](#3-create-employee)
   - [Edit Employee](#4-edit-employee)
   - [Delete Employee](#5-delete-employee)
   - [Route Guard (unauthenticated access)](#6-route-guard--unauthenticated-access)
7. [Data Model](#data-model)
8. [Security Model](#security-model)

---

## Overview

The **Employee Management System (EMS)** is a full-stack web application for managing employees in an organisation. It provides:

- **Secure login** via JWT authentication
- **Dashboard** with live workforce statistics and charts
- **Employee CRUD** — create, read, update, and delete employees with field validation
- **Filtering** by department and role
- **Responsive UI** built with React

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 4 (`localhost:5173`) |
| Backend | Node.js + Express.js (`localhost:3000`) |
| Database | SQLite via `better-sqlite3` |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Security | `helmet`, `cors`, `express-rate-limit` |
| Logging | `morgan` |

---

## Architecture Summary

```
┌──────────────────────────────────────┐
│         Browser (React SPA)          │
│  /login  /dashboard  /employees      │
│  PrivateRoute guards protected pages │
└────────────────┬─────────────────────┘
                 │ HTTP (Vite proxy → :3000 in dev)
                 │ (Express serves dist/ directly in prod)
                 ▼
┌──────────────────────────────────────┐
│         Express.js API (:3000)       │
│                                      │
│  helmet → cors → morgan → rateLimit  │
│                                      │
│  POST /api/auth/login                │
│  POST /api/auth/logout               │
│  GET  /api/dashboard/stats  [JWT]    │
│  GET/POST/PUT/DELETE /api/employees  │
│                          [JWT + val] │
│                                      │
│  authMiddleware → validateMiddleware │
│  errorHandler (centralised)          │
│  express.static(frontend-react/dist) │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│       SQLite (database.sqlite)       │
│  tables: employees, users            │
└──────────────────────────────────────┘
```

---

## User Flow

The diagram below shows every path a user can take through the application.

```mermaid
flowchart TD
    Start([User opens browser]) --> CheckToken{JWT token\nin localStorage?}

    CheckToken -->|No| Login["/login page"]
    CheckToken -->|Yes| Dashboard["/dashboard page"]

    Login --> EnterCreds[Enter username & password]
    EnterCreds --> PostLogin[POST /api/auth/login]

    PostLogin -->|Rate limited\n>20 req/15 min| RateError[Show rate-limit error]
    RateError --> EnterCreds

    PostLogin -->|Invalid credentials\n401| LoginError[Show error message]
    LoginError --> EnterCreds

    PostLogin -->|200 OK + JWT| SaveToken[Save token & user\nto localStorage]
    SaveToken --> Dashboard

    Dashboard --> FetchStats[GET /api/dashboard/stats]
    FetchStats -->|401/403| Logout2
    FetchStats -->|200 OK| ShowStats[Render stat cards\n& bar charts]

    ShowStats --> NavChoice{User clicks\nsidebar link}
    NavChoice -->|Employees| EmpPage["/employees page"]
    NavChoice -->|Dashboard| Dashboard
    NavChoice -->|Sign Out| Logout2[Clear localStorage\nRedirect to /login]

    EmpPage --> LoadEmps[GET /api/employees]
    LoadEmps -->|200 OK| ShowTable[Render employee table]

    ShowTable --> EmpAction{User action}

    EmpAction -->|Filter dept/role| ApplyFilter[GET /api/employees\n?department=...&role=...]
    ApplyFilter --> ShowTable

    EmpAction -->|Add Employee| OpenAddModal[Open Add modal]
    OpenAddModal --> FillForm[Fill in form fields]
    FillForm --> SubmitAdd[POST /api/employees]
    SubmitAdd -->|400 validation error| ShowFormError[Show field errors]
    ShowFormError --> FillForm
    SubmitAdd -->|409 duplicate email| ShowFormError
    SubmitAdd -->|201 Created| RefreshTable[Reload employee list]
    RefreshTable --> ShowTable

    EmpAction -->|Edit Employee| OpenEditModal[Open Edit modal\npre-filled with data]
    OpenEditModal --> EditForm[Modify fields]
    EditForm --> SubmitEdit[PUT /api/employees/:id]
    SubmitEdit -->|400 validation error| ShowEditError[Show field errors]
    ShowEditError --> EditForm
    SubmitEdit -->|200 OK| RefreshTable

    EmpAction -->|Delete Employee| ConfirmDelete{Confirm\ndialog?}
    ConfirmDelete -->|Cancel| ShowTable
    ConfirmDelete -->|Confirm| DeleteReq[DELETE /api/employees/:id]
    DeleteReq -->|404 Not Found| ShowDelError[Show error]
    DeleteReq -->|200 OK| RefreshTable

    Logout2 --> Login
```

---

## Page & Feature Reference

### `/login`
- **Purpose:** Authenticate the user
- **Access:** Public (redirects to `/dashboard` if already logged in)
- **Actions:**
  - Submit username + password → `POST /api/auth/login`
  - On success: stores JWT token and username in `localStorage`, navigates to `/dashboard`
  - On failure: displays an inline error message
- **Rate limit:** Max 20 login attempts per 15-minute window

### `/dashboard`
- **Purpose:** Workforce overview
- **Access:** Protected — requires valid JWT (`PrivateRoute` redirects to `/login` if no token)
- **Data:** `GET /api/dashboard/stats`
- **Displays:**
  - Total employee count
  - Average salary
  - Number of unique departments
  - Number of unique roles
  - Animated bar chart: employees by department
  - Animated bar chart: employees by role

### `/employees`
- **Purpose:** Full CRUD management of employee records
- **Access:** Protected
- **Features:**
  - Filter table by department and/or role
  - **Add Employee** — opens modal → `POST /api/employees`
  - **Edit Employee** — opens pre-filled modal → `PUT /api/employees/:id`
  - **Delete Employee** — confirmation dialog → `DELETE /api/employees/:id`
- **Validation (enforced by server):** name, valid email, department, role, valid date, salary ≥ 0

---

## API Reference

All protected endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | `{ username, password }` | Returns JWT token |
| `POST` | `/api/auth/logout` | ❌ | — | Stateless logout confirmation |
| `GET` | `/api/dashboard/stats` | ✅ | — | Total, avg salary, by dept, by role |
| `GET` | `/api/employees` | ✅ | — | List all employees (supports `?department=` `?role=`) |
| `GET` | `/api/employees/:id` | ✅ | — | Get single employee |
| `POST` | `/api/employees` | ✅ | Employee object | Create employee → `201` |
| `PUT` | `/api/employees/:id` | ✅ | Employee object | Update employee → `200` |
| `DELETE` | `/api/employees/:id` | ✅ | — | Delete employee → `200` |

**Employee object fields:**

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, non-empty |
| `email` | string | Required, valid email format, unique |
| `department` | string | Required, non-empty |
| `role` | string | Required, non-empty |
| `hireDate` | string | Required, valid ISO date (`YYYY-MM-DD`) |
| `salary` | number | Required, ≥ 0 |

---

## Sequence Diagrams

### 1. Login Flow

```mermaid
sequenceDiagram
    actor User
    participant React as React App
    participant RateLimit as Rate Limiter
    participant Auth as authController
    participant DB as SQLite

    User->>React: Enter username & password, click Sign In
    React->>RateLimit: POST /api/auth/login
    alt Too many attempts (>20 / 15 min)
        RateLimit-->>React: 429 Too Many Requests
        React-->>User: Show rate-limit error
    else Within limit
        RateLimit->>Auth: Forward request
        Auth->>DB: SELECT * FROM users WHERE username = ?
        DB-->>Auth: User row (or null)
        alt User not found
            Auth-->>React: 401 Invalid credentials
            React-->>User: Show error message
        else Wrong password
            Auth->>Auth: bcrypt.compareSync() → false
            Auth-->>React: 401 Invalid credentials
            React-->>User: Show error message
        else Valid credentials
            Auth->>Auth: bcrypt.compareSync() → true
            Auth->>Auth: generateToken({ id, username })
            Auth-->>React: 200 { token }
            React->>React: setAuth(token, username) → localStorage
            React-->>User: Navigate to /dashboard
        end
    end
```

---

### 2. View Dashboard

```mermaid
sequenceDiagram
    actor User
    participant React as React App
    participant PRoute as PrivateRoute
    participant Auth as authMiddleware
    participant Ctrl as dashboardController
    participant DB as SQLite

    User->>React: Navigate to /dashboard
    React->>PRoute: Check getToken()
    alt No token in localStorage
        PRoute-->>React: Redirect to /login
        React-->>User: Show login page
    else Token present
        PRoute-->>React: Render Dashboard
        React->>Auth: GET /api/dashboard/stats\nAuthorization: Bearer <token>
        Auth->>Auth: verifyToken(token)
        alt Token invalid or expired
            Auth-->>React: 403 Forbidden
            React-->>User: Show error message
        else Token valid
            Auth->>Ctrl: next() → getStats()
            Ctrl->>DB: SELECT COUNT(*) FROM employees
            Ctrl->>DB: SELECT department, COUNT(*) GROUP BY department
            Ctrl->>DB: SELECT role, COUNT(*) GROUP BY role
            Ctrl->>DB: SELECT AVG(salary) FROM employees
            DB-->>Ctrl: Stats results
            Ctrl-->>React: 200 { total, byDepartment, byRole, avgSalary }
            React-->>User: Render stat cards and bar charts
        end
    end
```

---

### 3. Create Employee

```mermaid
sequenceDiagram
    actor User
    participant React as React App
    participant Auth as authMiddleware
    participant Val as validateMiddleware
    participant Ctrl as employeeController
    participant DB as SQLite

    User->>React: Click "+ Add Employee"
    React-->>User: Open empty modal form

    User->>React: Fill in fields, click Save
    React->>Auth: POST /api/employees\nAuthorization: Bearer <token>\nBody: employee object
    Auth->>Auth: verifyToken(token)
    alt Token invalid
        Auth-->>React: 401 / 403
        React-->>User: Show auth error
    else Token valid
        Auth->>Val: next() → validateEmployee()
        alt Validation fails (missing/invalid fields)
            Val-->>React: 400 { errors: [...] }
            React-->>User: Show field error messages
        else Validation passes
            Val->>Ctrl: next() → createEmployee()
            Ctrl->>DB: INSERT INTO employees (...)
            alt Duplicate email
                DB-->>Ctrl: UNIQUE constraint error
                Ctrl-->>React: 409 Email already exists
                React-->>User: Show duplicate email error
            else Insert success
                DB-->>Ctrl: { lastInsertRowid }
                Ctrl-->>React: 201 { id, ...employee }
                React-->>User: Close modal, reload employee table
            end
        end
    end
```

---

### 4. Edit Employee

```mermaid
sequenceDiagram
    actor User
    participant React as React App
    participant Auth as authMiddleware
    participant Val as validateMiddleware
    participant Ctrl as employeeController
    participant DB as SQLite

    User->>React: Click "Edit" on an employee row
    React-->>User: Open modal pre-filled with employee data

    User->>React: Modify fields, click Save
    React->>Auth: PUT /api/employees/:id\nAuthorization: Bearer <token>\nBody: updated fields
    Auth->>Auth: verifyToken(token)
    Auth->>Val: next() → validateEmployee()
    alt Validation fails
        Val-->>React: 400 { errors: [...] }
        React-->>User: Show field errors
    else Validation passes
        Val->>Ctrl: next() → updateEmployee()
        Ctrl->>DB: UPDATE employees SET ... WHERE id = ?
        alt No row changed (ID not found)
            DB-->>Ctrl: changes = 0
            Ctrl-->>React: 404 Employee not found
            React-->>User: Show not-found error
        else Update success
            DB-->>Ctrl: changes = 1
            Ctrl-->>React: 200 { id, ...updated fields }
            React-->>User: Close modal, reload employee table
        end
    end
```

---

### 5. Delete Employee

```mermaid
sequenceDiagram
    actor User
    participant React as React App
    participant Browser as Browser Dialog
    participant Auth as authMiddleware
    participant Ctrl as employeeController
    participant DB as SQLite

    User->>React: Click "Delete" on an employee row
    React->>Browser: window.confirm("Delete this employee?")
    alt User clicks Cancel
        Browser-->>React: false
        React-->>User: No action taken
    else User clicks Confirm
        Browser-->>React: true
        React->>Auth: DELETE /api/employees/:id\nAuthorization: Bearer <token>
        Auth->>Auth: verifyToken(token)
        Auth->>Ctrl: next() → deleteEmployee()
        Ctrl->>DB: DELETE FROM employees WHERE id = ?
        alt Employee not found
            DB-->>Ctrl: changes = 0
            Ctrl-->>React: 404 Employee not found
            React-->>User: Show error message
        else Delete success
            DB-->>Ctrl: changes = 1
            Ctrl-->>React: 200 { message: "Employee deleted" }
            React-->>User: Reload employee table
        end
    end
```

---

### 6. Route Guard — Unauthenticated Access

```mermaid
sequenceDiagram
    actor User
    participant Browser as Browser
    participant React as React App
    participant PRoute as PrivateRoute
    participant LS as localStorage

    User->>Browser: Navigate to /dashboard or /employees
    Browser->>React: Render route
    React->>PRoute: Wrap protected page
    PRoute->>LS: getToken()
    LS-->>PRoute: null (no token)
    PRoute-->>React: <Navigate to="/login" replace />
    React-->>User: Redirected to /login page
    Note over User,React: User cannot access any\nprotected page without a\nvalid JWT token stored\nin localStorage
```

---

## Data Model

### `employees` table

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | UNIQUE, NOT NULL |
| `department` | TEXT | NOT NULL |
| `role` | TEXT | NOT NULL |
| `hireDate` | TEXT | NOT NULL (ISO format) |
| `salary` | REAL | NOT NULL |

### `users` table

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `username` | TEXT | UNIQUE, NOT NULL |
| `password` | TEXT | NOT NULL (bcrypt hash) |

> Default seeded user: `admin` / `admin123`

---

## Security Model

| Concern | Mechanism |
|---|---|
| **Authentication** | JWT signed with `JWT_SECRET` (8h expiry) |
| **Password storage** | bcrypt hash (salt rounds: 10) |
| **HTTP headers** | `helmet` sets Content-Security-Policy, X-Frame-Options, etc. |
| **CORS** | Restricted to `ALLOWED_ORIGIN` (default: `http://localhost:5173`) |
| **Brute force** | `express-rate-limit`: 20 login attempts per 15 minutes |
| **Input validation** | `validateMiddleware` validates all 6 employee fields server-side |
| **Route protection** | `authMiddleware` verifies JWT on every protected endpoint |
| **Client guard** | `PrivateRoute` component redirects unauthenticated users to `/login` |
| **Secrets** | `.env` file (never committed); `.env.example` provided as template |
