const { getDB } = require('../models/employeeModel');

function getAllEmployees(req, res) {
  const { department, role } = req.query;
  const db = getDB();
  let query = 'SELECT * FROM employees WHERE 1=1';
  const params = [];
  if (department) { query += ' AND department = ?'; params.push(department); }
  if (role) { query += ' AND role = ?'; params.push(role); }
  const employees = db.prepare(query).all(...params);
  db.close();
  res.json(employees);
}

function getEmployeeById(req, res) {
  const db = getDB();
  const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  db.close();
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
}

function createEmployee(req, res) {
  const { name, email, department, role, hireDate, salary } = req.body;
  const db = getDB();
  try {
    const result = db.prepare(
      'INSERT INTO employees (name, email, department, role, hireDate, salary) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, email, department, role, hireDate, salary);
    res.status(201).json({ id: result.lastInsertRowid, name, email, department, role, hireDate, salary });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ message: 'Email already exists' });
    throw err;
  } finally {
    db.close();
  }
}

function updateEmployee(req, res) {
  const { name, email, department, role, hireDate, salary } = req.body;
  const db = getDB();
  const result = db.prepare(
    'UPDATE employees SET name=?, email=?, department=?, role=?, hireDate=?, salary=? WHERE id=?'
  ).run(name, email, department, role, hireDate, salary, req.params.id);
  db.close();
  if (result.changes === 0) return res.status(404).json({ message: 'Employee not found' });
  res.json({ id: Number(req.params.id), name, email, department, role, hireDate, salary });
}

function deleteEmployee(req, res) {
  const db = getDB();
  const result = db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  db.close();
  if (result.changes === 0) return res.status(404).json({ message: 'Employee not found' });
  res.json({ message: 'Employee deleted' });
}

module.exports = { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };
