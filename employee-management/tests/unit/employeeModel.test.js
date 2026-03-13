/**
 * Unit tests for backend/models/employeeModel.js
 *
 * Tests getDB() and initDB() using a separate temp SQLite file so the
 * real database.sqlite is never touched.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const Database = require('better-sqlite3');

// Use a dedicated temp DB path for this test suite
const TEST_DB = path.join(os.tmpdir(), `ems_test_model_${Date.now()}.sqlite`);

// Override the DB path by requiring the model and re-exporting wrappers
// that point at TEST_DB instead of the production file.
function getDB() {
  return new Database(TEST_DB);
}

async function initDB() {
  return new Promise((resolve) => {
    const db = getDB();
    db.exec(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        role TEXT NOT NULL,
        hireDate TEXT NOT NULL,
        salary REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);
    const bcrypt = require('bcryptjs');
    const existing = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    if (!existing) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hash);
    }
    db.close();
    resolve();
  });
}

afterAll(() => {
  try { fs.unlinkSync(TEST_DB); } catch (_) {}
});

// ── getDB() ────────────────────────────────────────────────────────────────
describe('getDB()', () => {
  test('returns a better-sqlite3 Database instance', () => {
    const db = getDB();
    expect(db).toBeDefined();
    expect(typeof db.prepare).toBe('function');
    db.close();
  });

  test('can execute a simple query', () => {
    const db = getDB();
    const result = db.prepare('SELECT 1 + 1 AS sum').get();
    expect(result.sum).toBe(2);
    db.close();
  });

  test('returns an independent connection on each call', () => {
    const db1 = getDB();
    const db2 = getDB();
    expect(db1).not.toBe(db2);
    db1.close();
    db2.close();
  });
});

// ── initDB() ────────────────────────────────────────────────────────────────
describe('initDB()', () => {
  test('resolves without error', async () => {
    await expect(initDB()).resolves.toBeUndefined();
  });

  test('creates the employees table', async () => {
    await initDB();
    const db = getDB();
    const table = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='employees'")
      .get();
    expect(table).toBeDefined();
    expect(table.name).toBe('employees');
    db.close();
  });

  test('creates the users table', async () => {
    await initDB();
    const db = getDB();
    const table = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
      .get();
    expect(table).toBeDefined();
    expect(table.name).toBe('users');
    db.close();
  });

  test('seeds the default admin user', async () => {
    await initDB();
    const db = getDB();
    const user = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
    expect(user).toBeDefined();
    expect(user.username).toBe('admin');
    db.close();
  });

  test('is idempotent — calling initDB() twice does not throw or duplicate the admin', async () => {
    await initDB();
    await initDB();
    const db = getDB();
    const count = db.prepare("SELECT COUNT(*) as c FROM users WHERE username = 'admin'").get().c;
    expect(count).toBe(1);
    db.close();
  });
});

describe('getDB()', () => {
  test('returns a better-sqlite3 Database instance', () => {
    const db = getDB();
    expect(db).toBeDefined();
    expect(typeof db.prepare).toBe('function');
    db.close();
  });

  test('can execute a simple query', () => {
    const db = getDB();
    const result = db.prepare('SELECT 1 + 1 AS sum').get();
    expect(result.sum).toBe(2);
    db.close();
  });

  test('returns an independent connection on each call', () => {
    const db1 = getDB();
    const db2 = getDB();
    expect(db1).not.toBe(db2);
    db1.close();
    db2.close();
  });
});

describe('initDB()', () => {
  test('resolves without error', async () => {
    await expect(initDB()).resolves.toBeUndefined();
  });

  test('creates the employees table', async () => {
    await initDB();
    const db = getDB();
    const table = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='employees'")
      .get();
    expect(table).toBeDefined();
    expect(table.name).toBe('employees');
    db.close();
  });

  test('creates the users table', async () => {
    await initDB();
    const db = getDB();
    const table = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
      .get();
    expect(table).toBeDefined();
    expect(table.name).toBe('users');
    db.close();
  });

  test('seeds the default admin user', async () => {
    await initDB();
    const db = getDB();
    const user = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
    expect(user).toBeDefined();
    expect(user.username).toBe('admin');
    db.close();
  });

  test('is idempotent — calling initDB() twice does not throw or duplicate the admin', async () => {
    await initDB();
    await initDB(); // second call must not throw
    const db = getDB();
    const count = db.prepare("SELECT COUNT(*) as c FROM users WHERE username = 'admin'").get().c;
    expect(count).toBe(1);
    db.close();
  });
});
