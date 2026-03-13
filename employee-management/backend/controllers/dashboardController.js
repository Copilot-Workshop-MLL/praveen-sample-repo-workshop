const { getDB } = require('../models/employeeModel');

function getStats(req, res) {
  const db = getDB();
  const total = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  const byDepartment = db.prepare('SELECT department, COUNT(*) as count FROM employees GROUP BY department').all();
  const byRole = db.prepare('SELECT role, COUNT(*) as count FROM employees GROUP BY role').all();
  const avgSalary = db.prepare('SELECT AVG(salary) as avg FROM employees').get().avg || 0;
  db.close();
  res.json({ total, byDepartment, byRole, avgSalary: avgSalary.toFixed(2) });
}

module.exports = { getStats };
