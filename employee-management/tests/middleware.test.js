const authMiddleware = require('../backend/middleware/authMiddleware');
const { validateEmployee } = require('../backend/middleware/validateMiddleware');
const { generateToken } = require('../backend/utils/jwtUtils');

// ── authMiddleware ──────────────────────────────────────────────────────────

describe('authMiddleware', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test('calls next() with a valid token', () => {
    const token = generateToken({ id: 1, username: 'admin' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.username).toBe('admin');
  });

  test('returns 401 when no token is provided', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 for an invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid.token.xyz' } };
    const res = mockRes();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

// ── validateEmployee ────────────────────────────────────────────────────────

describe('validateEmployee', () => {
  const validBody = {
    name: 'Alice Smith',
    email: 'alice@example.com',
    department: 'Engineering',
    role: 'Developer',
    hireDate: '2024-01-15',
    salary: 70000
  };

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test('calls next() for a fully valid body', () => {
    const req = { body: { ...validBody } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('returns 400 when name is missing', () => {
    const req = { body: { ...validBody, name: '' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors).toContain('Name is required');
  });

  test('returns 400 for invalid email', () => {
    const req = { body: { ...validBody, email: 'not-an-email' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors).toContain('Valid email is required');
  });

  test('returns 400 when department is missing', () => {
    const req = { body: { ...validBody, department: '' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when role is missing', () => {
    const req = { body: { ...validBody, role: '' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 for invalid hireDate', () => {
    const req = { body: { ...validBody, hireDate: 'not-a-date' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors).toContain('Valid hire date is required');
  });

  test('returns 400 for negative salary', () => {
    const req = { body: { ...validBody, salary: -100 } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors).toContain('Valid salary is required');
  });
});
