const request = require('supertest');
const app = require('../backend/app');
const { initDB, getDB } = require('../backend/models/employeeModel');

let token;

beforeAll(async () => {
  await initDB();
  // Seed some employees for stats
  const db = getDB();
  db.prepare("DELETE FROM employees WHERE email LIKE '%@stats.com'").run();
  const insert = db.prepare(
    'INSERT INTO employees (name, email, department, role, hireDate, salary) VALUES (?, ?, ?, ?, ?, ?)'
  );
  insert.run('Stats Alice', 'alice@stats.com', 'Engineering', 'Developer', '2023-01-01', 80000);
  insert.run('Stats Bob', 'bob@stats.com', 'Marketing', 'Manager', '2022-05-10', 70000);
  insert.run('Stats Carol', 'carol@stats.com', 'Engineering', 'Designer', '2021-09-15', 60000);
  // Seed a recent hire for trends tests (within last 6 months)
  const recentDate = new Date();
  recentDate.setMonth(recentDate.getMonth() - 1);
  const recentHireDate = recentDate.toISOString().split('T')[0];
  insert.run('Stats Dave', 'dave@stats.com', 'Engineering', 'Developer', recentHireDate, 90000);
  db.close();

  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin123' });
  token = res.body.token;
});

afterAll(() => {
  const db = getDB();
  db.prepare("DELETE FROM employees WHERE email LIKE '%@stats.com'").run();
  db.close();
});

describe('GET /api/dashboard/stats', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(401);
  });

  test('returns correct shape with valid token', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.total).toBe('number');
    expect(Array.isArray(res.body.byDepartment)).toBe(true);
    expect(Array.isArray(res.body.byRole)).toBe(true);
    expect(res.body.avgSalary).toBeDefined();
  });

  test('total reflects seeded employees', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.total).toBeGreaterThanOrEqual(3);
  });

  test('byDepartment contains Engineering', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);
    const depts = res.body.byDepartment.map(d => d.department);
    expect(depts).toContain('Engineering');
  });

  test('avgSalary is a valid number string', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(isNaN(Number(res.body.avgSalary))).toBe(false);
  });
});

describe('GET /api/dashboard/trends', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/dashboard/trends');
    expect(res.status).toBe(401);
  });

  test('returns correct shape with valid token', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.monthlyTrends)).toBe(true);
    expect(Array.isArray(res.body.departmentTrends)).toBe(true);
  });

  test('monthlyTrends entries have expected fields', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${token}`);
    if (res.body.monthlyTrends.length > 0) {
      const entry = res.body.monthlyTrends[0];
      expect(entry).toHaveProperty('month');
      expect(entry).toHaveProperty('newHires');
      expect(entry).toHaveProperty('avgSalary');
    }
  });

  test('departmentTrends entries have expected fields', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${token}`);
    if (res.body.departmentTrends.length > 0) {
      const entry = res.body.departmentTrends[0];
      expect(entry).toHaveProperty('month');
      expect(entry).toHaveProperty('department');
      expect(entry).toHaveProperty('count');
    }
  });

  test('monthlyTrends contains recent hire data', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${token}`);
    // Dave was seeded with a hire date 1 month ago, so should appear in trends.
    const totalHires = res.body.monthlyTrends.reduce((sum, m) => sum + m.newHires, 0);
    expect(totalHires).toBeGreaterThanOrEqual(1);
  });
});
