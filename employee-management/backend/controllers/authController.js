const bcrypt = require('bcryptjs');
const { getDB } = require('../models/employeeModel');
const { generateToken } = require('../utils/jwtUtils');

function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' });
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  db.close();
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Invalid credentials' });
  const token = generateToken({ id: user.id, username: user.username });
  res.json({ token });
}

function logout(req, res) {
  // JWT is stateless; client should discard the token
  res.json({ message: 'Logged out successfully' });
}

module.exports = { login, logout };
