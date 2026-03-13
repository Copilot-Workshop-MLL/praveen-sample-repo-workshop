function validateEmployee(req, res, next) {
  const { name, email, department, role, hireDate, salary } = req.body;
  const errors = [];
  if (!name || name.trim() === '') errors.push('Name is required');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
  if (!department || department.trim() === '') errors.push('Department is required');
  if (!role || role.trim() === '') errors.push('Role is required');
  if (!hireDate || isNaN(Date.parse(hireDate))) errors.push('Valid hire date is required');
  if (salary === undefined || isNaN(Number(salary)) || Number(salary) < 0) errors.push('Valid salary is required');
  if (errors.length > 0) return res.status(400).json({ errors });
  next();
}

module.exports = { validateEmployee };
