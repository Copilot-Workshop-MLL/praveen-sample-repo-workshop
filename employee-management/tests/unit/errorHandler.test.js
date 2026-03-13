/**
 * Unit tests for backend/middleware/errorHandler.js
 *
 * Tests the centralised error-handling middleware in isolation — no HTTP
 * server is started. req/res/next are all plain mock objects.
 */
const errorHandler = require('../../backend/middleware/errorHandler');

// Helper: build a minimal mock response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler middleware', () => {
  beforeEach(() => {
    // Silence console output during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns the error status code when err.status is set', () => {
    const err = { status: 404, message: 'Not found' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
  });

  test('defaults to 500 when err.status is not set', () => {
    const err = new Error('Something exploded');
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Something exploded' });
  });

  test('returns "Internal Server Error" when err has no message', () => {
    const err = { status: 500 };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });

  test('returns 400 status for a validation-style error', () => {
    const err = { status: 400, message: 'Bad request data' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('logs to console.error in development (NODE_ENV != production)', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const err = new Error('dev error');
    err.stack = 'Error: dev error\n    at test';
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(console.error).toHaveBeenCalled();
    process.env.NODE_ENV = originalEnv;
  });
});
