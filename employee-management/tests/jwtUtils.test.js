const { generateToken, verifyToken } = require('../backend/utils/jwtUtils');

describe('jwtUtils', () => {
  describe('generateToken()', () => {
    test('returns a non-empty string', () => {
      const token = generateToken({ id: 1, username: 'admin' });
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('generates different tokens for different payloads', () => {
      const t1 = generateToken({ id: 1 });
      const t2 = generateToken({ id: 2 });
      expect(t1).not.toBe(t2);
    });
  });

  describe('verifyToken()', () => {
    test('decodes a valid token and returns the payload', () => {
      const payload = { id: 1, username: 'admin' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(1);
      expect(decoded.username).toBe('admin');
    });

    test('throws on an invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    test('throws on a tampered token', () => {
      const token = generateToken({ id: 1 });
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyToken(tampered)).toThrow();
    });
  });
});
