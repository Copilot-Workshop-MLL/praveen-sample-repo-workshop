# Step-by-Step Development Plan

## 1. Project Structure Setup
- Create `/backend`, `/frontend`, `/tests`, `/utils` or `/services` folders.
- Add a `.env` file for environment variables.

## 2. Backend (Express.js API)
### a. Basic Server
- Implement server entry point (`server.js` or `app.js`).
- Add health check endpoint (`GET /health`).

### b. Authentication
- Utility function: generate JWT tokens.
- Utility function: validate JWT tokens.
- Route: `/login` in `routes/auth.js` (validate credentials, return JWT).
- Middleware: `middleware/auth.js` (check JWT, attach user info).

### c. Protected Routes
- Add sample protected route (`GET /protected`) using auth middleware.

### d. Error Handling & Logging
- Centralized error handler middleware.
- Request logging middleware (Morgan or custom).

## 3. Frontend (UI)
- Set up basic HTML/CSS/JS or framework (React, Vue, etc.).
- Create login form and protected content view.
- Make layout responsive with CSS Flexbox/Grid and media queries.

## 4. Testing
- Unit tests for JWT utilities, auth middleware, route handlers.
- Integration tests for API endpoints.
- Frontend component/unit tests if using a framework.

## 5. Security & Environment
- Validate and sanitize all user input in API.
- Use HTTPS in production (document for deployment).
- Set up CORS policy in Express.js.

## 6. Documentation
- Update `README.md` with setup and usage instructions.
- Document API endpoints in markdown or Swagger/OpenAPI.

---

## Granularity for Easy-to-Test Functions
- Each utility (e.g., JWT generation/validation) as a separate function.
- Middleware modularized (one file per middleware).
- Route handlers small, with business logic in services.
- UI components small and focused.
- Write tests for each function and middleware in isolation before integration.
