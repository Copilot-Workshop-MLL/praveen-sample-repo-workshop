const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.sqlite');

function getDB() {
  return new Database(DB_PATH);
}

function initDB() {
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
    // Seed default admin user if not present (password: admin123)
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

module.exports = { getDB, initDB };
