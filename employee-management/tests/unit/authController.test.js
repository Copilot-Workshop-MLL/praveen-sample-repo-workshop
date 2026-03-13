/**
 * Unit tests for backend/controllers/authController.js
 *
 * The database is mocked so these tests run without any SQLite file.
 * bcryptjs is mocked to control compare results deterministically.
 */
const { login, logout } = require('../../backend/controllers/authController');

// ── Mock the DB ──────────────────────────────────────────────────────────────
const mockDB = {
  prepare: jest.fn(),
  close: jest.fn(),
};
jest.mock('../../backend/models/employeeModel', () => ({
  getDB: () => mockDB,
}));

// ── Mock bcryptjs ────────────────────────────────────────────────────────────
jest.mock('bcryptjs', () => ({
  compareSync: jest.fn(),
}));
const bcrypt = require('bcryptjs');

// ── Helpers ──────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const HASHED_PW = '$2a$10$hashedpassword';
const adminUser = { id: 1, username: 'admin', password: HASHED_PW };

beforeEach(() => {
  jest.clearAllMocks();
});

// ── login() ──────────────────────────────────────────────────────────────────
describe('authController.login()', () => {
  test('returns 400 when username is missing', () => {
    const req = { body: { password: 'admin123' } };
    const res = mockRes();
    login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Username and password required' });
  });

  test('returns 400 when password is missing', () => {
    const req = { body: { username: 'admin' } };
    const res = mockRes();
    login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when body is empty', () => {
    const req = { body: {} };
    const res = mockRes();
    login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 401 when user is not found in DB', () => {
    mockDB.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(null) });
    const req = { body: { username: 'nobody', password: 'pass' } };
    const res = mockRes();
    login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  test('returns 401 when password does not match', () => {
    mockDB.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(adminUser) });
    bcrypt.compareSync.mockReturnValue(false);
    const req = { body: { username: 'admin', password: 'wrongpass' } };
    const res = mockRes();
    login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 200 and a token when credentials are valid', () => {
    mockDB.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(adminUser) });
    bcrypt.compareSync.mockReturnValue(true);
    const req = { body: { username: 'admin', password: 'admin123' } };
    const res = mockRes();
    login(req, res);
    expect(res.status).not.toHaveBeenCalledWith(401);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty('token');
    expect(typeof jsonArg.token).toBe('string');
  });

  test('closes the DB connection in all code paths', () => {
    mockDB.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(null) });
    const req = { body: { username: 'x', password: 'y' } };
    login(req, mockRes());
    expect(mockDB.close).toHaveBeenCalled();
  });
});

// ── logout() ─────────────────────────────────────────────────────────────────
describe('authController.logout()', () => {
  test('returns 200 with a success message', () => {
    const req = {};
    const res = mockRes();
    logout(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
  });

  test('does not return an error status', () => {
    const req = {};
    const res = mockRes();
    logout(req, res);
    expect(res.status).not.toHaveBeenCalled();
  });
});
