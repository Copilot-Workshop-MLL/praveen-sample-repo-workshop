const { factorial, isValidEmail, printValidEmails } = require('./factorial');

describe('factorial', () => {
  test('returns 1 for 0', () => {
    expect(factorial(0)).toBe(1);
  });
  test('returns 1 for 1', () => {
    expect(factorial(1)).toBe(1);
  });
  test('returns 120 for 5', () => {
    expect(factorial(5)).toBe(120);
  });
  test('returns 3628800 for 10', () => {
    expect(factorial(10)).toBe(3628800);
  });
});

describe('isValidEmail', () => {
  test('valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });
  test('invalid email', () => {
    expect(isValidEmail('notanemail')).toBe(false);
  });
  test('empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('printValidEmails', () => {
  test('prints only valid emails', () => {
    const names = ['Alice', 'bob@gmail.com', 'Charlie', 'david@example.com'];
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printValidEmails(names);
    expect(logSpy).toHaveBeenCalledWith('bob@gmail.com');
    expect(logSpy).toHaveBeenCalledWith('david@example.com');
    expect(logSpy).not.toHaveBeenCalledWith('Alice');
    expect(logSpy).not.toHaveBeenCalledWith('Charlie');
    logSpy.mockRestore();
  });
});
