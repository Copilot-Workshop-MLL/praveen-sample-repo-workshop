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

function getTrends(req, res) {
  const db = getDB();

  // Monthly new hires and average salary for the last 6 months
  const monthlyTrends = db.prepare(`
    SELECT strftime('%Y-%m', hireDate) as month,
           COUNT(*) as newHires,
           ROUND(AVG(salary), 2) as avgSalary
    FROM employees
    WHERE hireDate >= date('now', '-6 months')
    GROUP BY month
    ORDER BY month ASC
  `).all();

  // Department headcount per month for the last 6 months
  const departmentTrends = db.prepare(`
    SELECT strftime('%Y-%m', hireDate) as month,
           department,
           COUNT(*) as count
    FROM employees
    WHERE hireDate >= date('now', '-6 months')
    GROUP BY month, department
    ORDER BY month ASC, department ASC
  `).all();

  db.close();
  res.json({ monthlyTrends, departmentTrends });
}

module.exports = { getStats, getTrends };
