/**
 * Unit tests for backend/controllers/dashboardController.js
 *
 * The database is fully mocked — no SQLite file is read or written.
 */
const { getStats } = require('../../backend/controllers/dashboardController');

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
