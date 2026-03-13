/**
 * Unit tests for backend/controllers/employeeController.js
 *
 * The database is fully mocked — no SQLite file is read or written.
 * Each test controls exactly what the DB returns so behaviour is deterministic.
 */
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../../backend/controllers/employeeController');

// ── Mock the DB ──────────────────────────────────────────────────────────────
const mockStmt = { all: jest.fn(), get: jest.fn(), run: jest.fn() };
const mockDB = { prepare: jest.fn(() => mockStmt), close: jest.fn() };
jest.mock('../../backend/models/employeeModel', () => ({ getDB: () => mockDB }));

// ── Helpers ──────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const sampleEmployee = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  department: 'Engineering',
  role: 'Developer',
  hireDate: '2023-01-01',
  salary: 80000,
};

beforeEach(() => jest.clearAllMocks());

// ── getAllEmployees() ─────────────────────────────────────────────────────────
describe('employeeController.getAllEmployees()', () => {
  test('returns all employees with no filters', () => {
    mockStmt.all.mockReturnValue([sampleEmployee]);
    const req = { query: {} };
    const res = mockRes();
    getAllEmployees(req, res);
    expect(res.json).toHaveBeenCalledWith([sampleEmployee]);
  });

  test('returns an empty array when no employees exist', () => {
    mockStmt.all.mockReturnValue([]);
    const req = { query: {} };
    const res = mockRes();
    getAllEmployees(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('passes department filter to the query', () => {
    mockStmt.all.mockReturnValue([sampleEmployee]);
    const req = { query: { department: 'Engineering' } };
    const res = mockRes();
    getAllEmployees(req, res);
    // prepare() should have been called with a query containing the filter
    const sql = mockDB.prepare.mock.calls[0][0];
    expect(sql).toContain('department');
  });

  test('passes role filter to the query', () => {
    mockStmt.all.mockReturnValue([sampleEmployee]);
    const req = { query: { role: 'Developer' } };
    const res = mockRes();
    getAllEmployees(req, res);
    const sql = mockDB.prepare.mock.calls[0][0];
    expect(sql).toContain('role');
  });

  test('closes the DB connection', () => {
    mockStmt.all.mockReturnValue([]);
    getAllEmployees({ query: {} }, mockRes());
    expect(mockDB.close).toHaveBeenCalled();
  });
});

// ── getEmployeeById() ─────────────────────────────────────────────────────────
describe('employeeController.getEmployeeById()', () => {
  test('returns the employee when found', () => {
    mockStmt.get.mockReturnValue(sampleEmployee);
    const req = { params: { id: '1' } };
    const res = mockRes();
    getEmployeeById(req, res);
    expect(res.json).toHaveBeenCalledWith(sampleEmployee);
  });

  test('returns 404 when employee is not found', () => {
    mockStmt.get.mockReturnValue(undefined);
    const req = { params: { id: '999' } };
    const res = mockRes();
    getEmployeeById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Employee not found' });
  });

  test('closes the DB connection', () => {
    mockStmt.get.mockReturnValue(sampleEmployee);
    getEmployeeById({ params: { id: '1' } }, mockRes());
    expect(mockDB.close).toHaveBeenCalled();
  });
});

// ── createEmployee() ──────────────────────────────────────────────────────────
describe('employeeController.createEmployee()', () => {
  test('returns 201 with the created employee', () => {
    mockStmt.run.mockReturnValue({ lastInsertRowid: 42 });
    const req = { body: { ...sampleEmployee } };
    const res = mockRes();
    createEmployee(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }));
  });

  test('returns 409 on duplicate email (UNIQUE constraint)', () => {
    mockStmt.run.mockImplementation(() => {
      const err = new Error('UNIQUE constraint failed: employees.email');
      throw err;
    });
    const req = { body: { ...sampleEmployee } };
    const res = mockRes();
    createEmployee(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already exists' });
  });

  test('closes the DB connection even when an error is thrown', () => {
    mockStmt.run.mockImplementation(() => {
      throw new Error('UNIQUE constraint failed: employees.email');
    });
    createEmployee({ body: { ...sampleEmployee } }, mockRes());
    expect(mockDB.close).toHaveBeenCalled();
  });
});

// ── updateEmployee() ──────────────────────────────────────────────────────────
describe('employeeController.updateEmployee()', () => {
  test('returns 200 with the updated employee', () => {
    mockStmt.run.mockReturnValue({ changes: 1 });
    const req = { params: { id: '1' }, body: { ...sampleEmployee } };
    const res = mockRes();
    updateEmployee(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test('returns 404 when no rows were changed', () => {
    mockStmt.run.mockReturnValue({ changes: 0 });
    const req = { params: { id: '999' }, body: { ...sampleEmployee } };
    const res = mockRes();
    updateEmployee(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('closes the DB connection', () => {
    mockStmt.run.mockReturnValue({ changes: 1 });
    updateEmployee({ params: { id: '1' }, body: { ...sampleEmployee } }, mockRes());
    expect(mockDB.close).toHaveBeenCalled();
  });
});

// ── deleteEmployee() ──────────────────────────────────────────────────────────
describe('employeeController.deleteEmployee()', () => {
  test('returns 200 with a success message', () => {
    mockStmt.run.mockReturnValue({ changes: 1 });
    const req = { params: { id: '1' } };
    const res = mockRes();
    deleteEmployee(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Employee deleted' });
  });

  test('returns 404 when employee does not exist', () => {
    mockStmt.run.mockReturnValue({ changes: 0 });
    const req = { params: { id: '999' } };
    const res = mockRes();
    deleteEmployee(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Employee not found' });
  });

  test('closes the DB connection', () => {
    mockStmt.run.mockReturnValue({ changes: 1 });
    deleteEmployee({ params: { id: '1' } }, mockRes());
    expect(mockDB.close).toHaveBeenCalled();
  });
});
