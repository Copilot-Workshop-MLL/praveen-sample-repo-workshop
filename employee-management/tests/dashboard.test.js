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
