/**
 * Extended unit tests for backend/middleware/validateMiddleware.js
 *
 * Covers edge cases not addressed in middleware.test.js:
 *   - salary = 0 is valid (boundary)
 *   - whitespace-only strings treated as empty
 *   - multiple errors returned at once
 *   - salary as a numeric string (coercion)
 */
const { validateEmployee } = require('../../backend/middleware/validateMiddleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const validBody = {
  name: 'Bob Jones',
  email: 'bob@example.com',
  department: 'Finance',
  role: 'Analyst',
  hireDate: '2024-03-01',
  salary: 60000,
};

describe('validateEmployee — edge cases', () => {
  test('salary of 0 is valid (boundary value)', () => {
    const req = { body: { ...validBody, salary: 0 } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('salary as a numeric string is accepted', () => {
    const req = { body: { ...validBody, salary: '55000' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('whitespace-only name is rejected', () => {
    const req = { body: { ...validBody, name: '   ' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('whitespace-only department is rejected', () => {
    const req = { body: { ...validBody, department: '   ' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('whitespace-only role is rejected', () => {
    const req = { body: { ...validBody, role: '\t' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('multiple invalid fields returns all errors at once', () => {
    const req = { body: { name: '', email: 'bad', department: '', role: '', hireDate: 'nope', salary: -1 } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const { errors } = res.json.mock.calls[0][0];
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });

  test('salary of NaN is rejected', () => {
    const req = { body: { ...validBody, salary: NaN } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('salary of undefined is rejected', () => {
    const { salary, ...bodyWithoutSalary } = validBody;
    const req = { body: bodyWithoutSalary };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('valid ISO date formats are accepted', () => {
    const req = { body: { ...validBody, hireDate: '2020-12-31' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('email with subdomain is accepted', () => {
    const req = { body: { ...validBody, email: 'user@mail.company.com' } };
    const res = mockRes();
    const next = jest.fn();
    validateEmployee(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
