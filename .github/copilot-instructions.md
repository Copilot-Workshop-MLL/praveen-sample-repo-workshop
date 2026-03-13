# Copilot Agent Instructions

## ❌ Do NOT modify `package.json`

**Never edit, overwrite, or suggest changes to any `package.json` file in this repository**, including:

- `/package.json`
- `/employee-management/package.json`
- `/employee-management/frontend-react/package.json`

This includes:
- Adding or removing dependencies
- Changing version numbers
- Modifying scripts, jest config, or any other fields

If a task seems to require a `package.json` change (e.g. adding a library), **stop and ask the user for explicit approval** before proceeding.

---

## General Guidelines

- Always check `architecture.md` before making significant structural changes.
- Follow the phased plan in `plan.md` — complete and verify each step before moving to the next.
- All new backend files go under `employee-management/backend/`.
- All new React components go under `employee-management/frontend-react/src/`.
- The `employee-management/frontend/` directory is **legacy HTML/CSS/JS — do not add new files there**.
- The active frontend is `employee-management/frontend-react/` (React + Vite).
- Tests go under `employee-management/tests/unit/` (unit) or `employee-management/tests/` (integration).
- Never commit `.env` or `database.sqlite`.
