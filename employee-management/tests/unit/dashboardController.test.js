/**
 * Unit tests for backend/controllers/dashboardController.js
 *
 * The database is fully mocked — no SQLite file is read or written.
 */
const { getStats, getTrends } = require('../../backend/controllers/dashboardController');

// ── Mock the DB ──────────────────────────────────────────────────────────────
// We need prepare() to return different statements for each SQL query,
// so we use a counter to map calls in order.
let callIndex = 0;
const queries = [];

const mockDB = {
  prepare: jest.fn((sql) => {
    const idx = callIndex++;
    return { get: () => queries[idx], all: () => queries[idx] };
  }),
  close: jest.fn(),
};

jest.mock('../../backend/models/employeeModel', () => ({ getDB: () => mockDB }));

// ── Helper ───────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Set up mock DB to return:
 *   - total COUNT
 *   - byDepartment rows
 *   - byRole rows
 *   - avgSalary value
 */
function setupMock({ total = 0, byDepartment = [], byRole = [], avg = null } = {}) {
  callIndex = 0;
  queries.length = 0;
  queries.push({ count: total });           // SELECT COUNT(*)
  queries.push(byDepartment);               // GROUP BY department
  queries.push(byRole);                     // GROUP BY role
  queries.push({ avg });                    // AVG(salary)
  mockDB.prepare.mockClear();
  mockDB.close.mockClear();
}

/**
 * Set up mock DB for getTrends — expects 2 queries:
 *   1. Monthly trends (newHires + avgSalary per month)
 *   2. Department trends (count per month+department)
 */
function setupTrendsMock({ monthlyTrends = [], departmentTrends = [] } = {}) {
  callIndex = 0;
  queries.length = 0;
  queries.push(monthlyTrends);      // monthly newHires + avgSalary
  queries.push(departmentTrends);   // department counts per month
  mockDB.prepare.mockClear();
  mockDB.close.mockClear();
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('dashboardController.getStats()', () => {
  test('returns correct total employee count', () => {
    setupMock({ total: 5 });
    const res = mockRes();
    getStats({}, res);
    expect(res.json.mock.calls[0][0].total).toBe(5);
  });

  test('returns byDepartment breakdown', () => {
    const byDept = [{ department: 'Engineering', count: 3 }, { department: 'HR', count: 2 }];
    setupMock({ total: 5, byDepartment: byDept });
    const res = mockRes();
    getStats({}, res);
    expect(res.json.mock.calls[0][0].byDepartment).toEqual(byDept);
  });

  test('returns byRole breakdown', () => {
    const byRole = [{ role: 'Developer', count: 4 }];
    setupMock({ total: 4, byRole });
    const res = mockRes();
    getStats({}, res);
    expect(res.json.mock.calls[0][0].byRole).toEqual(byRole);
  });

  test('returns avgSalary as a string with 2 decimal places', () => {
    setupMock({ total: 2, avg: 72500 });
    const res = mockRes();
    getStats({}, res);
    expect(res.json.mock.calls[0][0].avgSalary).toBe('72500.00');
  });

  test('returns avgSalary of "0.00" when no employees exist (avg is null)', () => {
    setupMock({ total: 0, avg: null });
    const res = mockRes();
    getStats({}, res);
    expect(res.json.mock.calls[0][0].avgSalary).toBe('0.00');
  });

  test('closes the DB connection', () => {
    setupMock();
    getStats({}, mockRes());
    expect(mockDB.close).toHaveBeenCalled();
  });

  test('response shape has all required keys', () => {
    setupMock({ total: 1, byDepartment: [], byRole: [], avg: 50000 });
    const res = mockRes();
    getStats({}, res);
    const body = res.json.mock.calls[0][0];
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('byDepartment');
    expect(body).toHaveProperty('byRole');
    expect(body).toHaveProperty('avgSalary');
  });
});

// ── getTrends tests ───────────────────────────────────────────────────────────
describe('dashboardController.getTrends()', () => {
  test('returns correct response shape with monthlyTrends and departmentTrends', () => {
    setupTrendsMock();
    const res = mockRes();
    getTrends({}, res);
    const body = res.json.mock.calls[0][0];
    expect(body).toHaveProperty('monthlyTrends');
    expect(body).toHaveProperty('departmentTrends');
  });

  test('returns empty arrays when no data in last 6 months', () => {
    setupTrendsMock({ monthlyTrends: [], departmentTrends: [] });
    const res = mockRes();
    getTrends({}, res);
    const body = res.json.mock.calls[0][0];
    expect(body.monthlyTrends).toEqual([]);
    expect(body.departmentTrends).toEqual([]);
  });

  test('returns monthly trends with newHires and avgSalary', () => {
    const monthlyTrends = [
      { month: '2025-10', newHires: 2, avgSalary: 75000.0 },
      { month: '2025-11', newHires: 1, avgSalary: 80000.0 },
    ];
    setupTrendsMock({ monthlyTrends });
    const res = mockRes();
    getTrends({}, res);
    expect(res.json.mock.calls[0][0].monthlyTrends).toEqual(monthlyTrends);
  });

  test('returns department trends with month, department, and count', () => {
    const departmentTrends = [
      { month: '2025-10', department: 'Engineering', count: 2 },
      { month: '2025-10', department: 'HR', count: 1 },
    ];
    setupTrendsMock({ departmentTrends });
    const res = mockRes();
    getTrends({}, res);
    expect(res.json.mock.calls[0][0].departmentTrends).toEqual(departmentTrends);
  });

  test('closes the DB connection', () => {
    setupTrendsMock();
    getTrends({}, mockRes());
    expect(mockDB.close).toHaveBeenCalled();
  });

  test('monthlyTrends entries have expected shape', () => {
    const monthlyTrends = [{ month: '2025-12', newHires: 3, avgSalary: 90000.0 }];
    setupTrendsMock({ monthlyTrends });
    const res = mockRes();
    getTrends({}, res);
    const entry = res.json.mock.calls[0][0].monthlyTrends[0];
    expect(entry).toHaveProperty('month');
    expect(entry).toHaveProperty('newHires');
    expect(entry).toHaveProperty('avgSalary');
  });
});

