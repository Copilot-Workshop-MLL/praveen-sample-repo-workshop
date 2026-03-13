---
name: issue2Agent
description: "Agent mode for Issue 2 — Improved Customisability: flexible filtering, column sorting, theme switching (light/dark/focus), and column visibility for the EMS React frontend."
tools: []
---

# Issue 2 Agent — Improved Customisability

You are implementing **Issue 2: Improved Customisability** for the Employee
Management System. Work through each feature in the order listed below.
Complete and verify one feature before starting the next.

---

## 🔒 Hard Constraints

- **Never edit any `package.json` file** — not `/package.json`,
  `employee-management/package.json`, or
  `employee-management/frontend-react/package.json`.
  If a task appears to require a new library, implement it with vanilla
  CSS / React state instead, or stop and ask the user.
- Always read `architecture.md` before making any structural changes.
- The **active frontend** is `employee-management/frontend-react/` only.
  Do **not** touch `employee-management/frontend/` — it is legacy.
- All new React components → `frontend-react/src/components/`
- All new styles → `frontend-react/src/index.css`
- After every code change run `npm run test:unit` from
  `employee-management/` and confirm **64/64 pass** before continuing.
- After all features are done run `npm test` and confirm **103/103 pass**.

---

## 📋 Feature A — Flexible Filtering & Column Sorting

**Primary file:** `frontend-react/src/pages/Employees.jsx`

### A1 — Extended Filters (client-side)

The existing filter bar has `department` and `role` text inputs.
Add four more inputs inside the `.filters` div:

| Input | Type | Placeholder | State variable |
|-------|------|-------------|----------------|
| Hire date from | `date` | `Hired from` | `filterHireFrom` |
| Hire date to | `date` | `Hired to` | `filterHireTo` |
| Min salary | `number` | `Min salary` | `filterSalaryMin` |
| Max salary | `number` | `Max salary` | `filterSalaryMax` |

- Apply these four filters **client-side** after the API returns data —
  do NOT change any backend API endpoint or query parameter.
- Filter logic:
  - `filterHireFrom` → keep employees where `hireDate >= filterHireFrom`
  - `filterHireTo`   → keep employees where `hireDate <= filterHireTo`
  - `filterSalaryMin` → keep employees where `salary >= Number(filterSalaryMin)`
  - `filterSalaryMax` → keep employees where `salary <= Number(filterSalaryMax)`
- The "Clear" button must reset all six filter fields (including the new four).

### A2 — Sortable Column Headers

Make every `<th>` in the employees table clickable:

- Maintain two pieces of state: `sortKey` (column field name) and
  `sortDir` (`'asc'` | `'desc'`).
- Clicking a column that is **not** currently sorted → sort ascending.
- Clicking the **active** sort column → toggle direction.
- Show `▲` after the label when ascending, `▼` when descending.
- Sortable columns and their data keys:

  | Header label | Data key |
  |---|---|
  | Name | `name` |
  | Department | `department` |
  | Role | `role` |
  | Hire Date | `hireDate` |
  | Salary | `salary` |

- ID and Actions columns are **not** sortable.

### A3 — Persist Preferences

Save all filter values + sort state to `localStorage` under the key
`ems_emp_prefs` as a JSON object. Restore them on component mount.

```js
// Shape stored in localStorage
{
  filterDept: '',
  filterRole: '',
  filterHireFrom: '',
  filterHireTo: '',
  filterSalaryMin: '',
  filterSalaryMax: '',
  sortKey: 'name',
  sortDir: 'asc'
}
```

---

## 📋 Feature B — Theme Switching

**Primary files:** `frontend-react/src/components/Sidebar.jsx`,
`frontend-react/src/index.css`, `frontend-react/src/main.jsx`

### B1 — Theme Toggle in Sidebar

Add a theme toggle button in `.sidebar-footer`, below the logout button.

- Cycles on each click: **Light → Dark → Focus → Light**
- Display: icon + label
  - ☀️ `Light`
  - 🌙 `Dark`
  - 🎯 `Focus`
- Apply the theme by setting `data-theme` on `<html>`:
  ```js
  document.documentElement.setAttribute('data-theme', theme);
  ```
- Persist the chosen theme in `localStorage` under the key `ems_theme`.

### B2 — Apply Theme on Initial Load

In `frontend-react/src/main.jsx`, **before** `ReactDOM.createRoot(...)`,
read and apply the saved theme to prevent flash of unstyled content:

```js
const savedTheme = localStorage.getItem('ems_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
```

### B3 — CSS Theme Variables

Add the following blocks to `index.css`:

**Dark mode** (`[data-theme="dark"]`):
```css
[data-theme="dark"] {
  --bg: #0f1117;
  --card-bg: #1a1d27;
  --text: #e0e0e0;
  --text-muted: #9aa0b4;
  --border: #2e3248;
}
[data-theme="dark"] body          { background: var(--bg); color: var(--text); }
[data-theme="dark"] .stat-card,
[data-theme="dark"] .chart-card,
[data-theme="dark"] .table-card,
[data-theme="dark"] .modal-box    { background: var(--card-bg); color: var(--text); }
[data-theme="dark"] .sidebar      { background: linear-gradient(180deg,#0d1333,#1a1d27); }
[data-theme="dark"] input         { background: #1e2135; color: var(--text); border-color: var(--border); }
[data-theme="dark"] td, [data-theme="dark"] th { border-color: var(--border); }
[data-theme="dark"] tbody tr:hover td { background: #22263a; }
```

**Focus mode** (`[data-theme="focus"]`):
```css
[data-theme="focus"] .sidebar        { width: 60px; }
[data-theme="focus"] .sidebar-brand,
[data-theme="focus"] .nav-item span,
[data-theme="focus"] .user-details,
[data-theme="focus"] .logout-btn     { display: none; }
[data-theme="focus"] .main           { margin-left: 60px; padding: 1rem; }
[data-theme="focus"] .stat-card,
[data-theme="focus"] .chart-card,
[data-theme="focus"] .table-card     { box-shadow: none; }
[data-theme="focus"] body            { filter: grayscale(40%); }
[data-theme="focus"] .btn-primary    { filter: none; }
```

---

## 📋 Feature C — Column Visibility

**Primary file:** `frontend-react/src/pages/Employees.jsx`

### C1 — "Columns ▾" Dropdown

Add a **"Columns ▾"** button in `.page-header` next to the
"+ Add Employee" button.

- Clicking it opens a small dropdown panel listing three optional columns,
  each with a checkbox:
  - ☑ Email
  - ☑ Hire Date
  - ☑ Salary
- ID, Name, Department, Role, and Actions are always visible and are **not**
  listed in the dropdown.
- Close the dropdown when the user clicks outside it:
  ```js
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.col-dropdown')) setColMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  ```

### C2 — Apply Visibility

Use a state object `colVisible`:
```js
const [colVisible, setColVisible] = useState({ email: true, hireDate: true, salary: true });
```

Conditionally render each `<th>` and its corresponding `<td>`:
```jsx
{colVisible.email    && <th>Email</th>}
{colVisible.hireDate && <th>Hire Date</th>}
{colVisible.salary   && <th>Salary</th>}
```

### C3 — Persist Visibility

Save `colVisible` to `localStorage` under `ems_col_visibility`.
Restore it on mount.

### C4 — Dropdown Styles

Add to `index.css`:
```css
.col-dropdown        { position: relative; display: inline-block; }
.col-menu            { position: absolute; right: 0; top: calc(100% + 6px);
                       background: #fff; border: 1.5px solid #dcdde1;
                       border-radius: 8px; padding: 0.6rem 0.8rem;
                       box-shadow: 0 4px 16px rgba(0,0,0,0.1); z-index: 50;
                       min-width: 150px; }
[data-theme="dark"] .col-menu { background: #1a1d27; border-color: #2e3248; color: #e0e0e0; }
.col-menu label      { display: flex; align-items: center; gap: 0.5rem;
                       font-size: 0.9rem; padding: 0.3rem 0; cursor: pointer; }
.col-menu input[type="checkbox"] { width: auto; }
```

---

## ✅ Acceptance Criteria Checklist

Work through each item in order. Do not proceed until the current item passes.

### Feature A
- [ ] Hire date `from/to` filters narrow the displayed list correctly
- [ ] Salary `min/max` filters narrow the displayed list correctly
- [ ] "Clear" resets all six filter fields
- [ ] Clicking a column header sorts the table ascending on first click
- [ ] Clicking the same column header again sorts descending
- [ ] Active sort column shows ▲ or ▼ indicator
- [ ] Filters and sort state survive a full page refresh

### Feature B
- [ ] Theme toggle cycles Light → Dark → Focus → Light
- [ ] Dark mode applies correct colours on Login, Dashboard, and Employees
- [ ] Focus mode collapses sidebar to icon-only (60px)
- [ ] Selected theme persists after page refresh with no visual flash

### Feature C
- [ ] "Columns ▾" dropdown opens on click and closes on outside click
- [ ] Unchecking Email hides both the `<th>` and all `<td>` cells in that column
- [ ] Unchecking Hire Date and Salary behaves the same
- [ ] Column visibility persists after page refresh

### Tests
- [ ] `npm run test:unit` → **64/64 passing**
- [ ] `npm test` → **103/103 passing**
- [ ] No `package.json` file was modified

---

## 🗂 Implementation Order

1. **Feature B** — CSS variables + sidebar toggle + `main.jsx` init
2. **Feature A** — extended filters + sort + localStorage
3. **Feature C** — column visibility dropdown + localStorage
4. Run `npm test` → confirm 103/103
5. Update `plan.md` to record Issue 2 as complete

---

## 📁 Files to Modify

| File | Changes |
|------|---------|
| `frontend-react/src/main.jsx` | Apply saved theme before React mounts |
| `frontend-react/src/components/Sidebar.jsx` | Add theme toggle button |
| `frontend-react/src/pages/Employees.jsx` | Filters, sort, column visibility |
| `frontend-react/src/index.css` | Dark + Focus theme CSS, col-menu styles |
| **DO NOT TOUCH** | `employee-management/frontend/` (legacy) |
| **DO NOT TOUCH** | any `package.json` |
