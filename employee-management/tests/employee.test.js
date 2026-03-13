const request = require('supertest');
const app = require('../backend/app');
const { initDB, getDB } = require('../backend/models/employeeModel');

let token;

const validEmployee = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  department: 'Engineering',
  role: 'Developer',
  hireDate: '2023-06-01',
  salary: 85000
};

beforeAll(async () => {
  await initDB();
  // Clean up test employees
  const db = getDB();
  db.prepare("DELETE FROM employees WHERE email LIKE '%@example.com'").run();
  db.close();
  // Get auth token
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin123' });
  token = res.body.token;
});

afterAll(() => {
  const db = getDB();
  db.prepare("DELETE FROM employees WHERE email LIKE '%@example.com'").run();
  db.close();
});

// ── Auth guard ──────────────────────────────────────────────────────────────

describe('Employee routes — auth guard', () => {
  test('returns 401 with no token', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(401);
  });

  test('returns 403 with invalid token', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', 'Bearer invalid.token');
    expect(res.status).toBe(403);
  });
});

// ── CREATE ──────────────────────────────────────────────────────────────────

describe('POST /api/employees', () => {
  test('creates a new employee and returns 201', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(validEmployee);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Jane Doe');
  });

  test('returns 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(validEmployee);
    expect(res.status).toBe(409);
  });

  test('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Incomplete' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

// ── READ ALL ────────────────────────────────────────────────────────────────

describe('GET /api/employees', () => {
  test('returns an array of employees', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('filters by department', async () => {
    const res = await request(app)
      .get('/api/employees?department=Engineering')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    res.body.forEach(e => expect(e.department).toBe('Engineering'));
  });

  test('filters by role', async () => {
    const res = await request(app)
      .get('/api/employees?role=Developer')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    res.body.forEach(e => expect(e.role).toBe('Developer'));
  });
});

// ── READ ONE ────────────────────────────────────────────────────────────────

describe('GET /api/employees/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, email: 'getbyid@example.com' });
    createdId = res.body.id;
  });

  test('returns the employee for a valid ID', async () => {
    const res = await request(app)
      .get(`/api/employees/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  test('returns 404 for a non-existing ID', async () => {
    const res = await request(app)
      .get('/api/employees/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

// ── UPDATE ──────────────────────────────────────────────────────────────────

describe('PUT /api/employees/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, email: 'update@example.com' });
    createdId = res.body.id;
  });

  test('updates employee and returns updated record', async () => {
    const res = await request(app)
      .put(`/api/employees/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, email: 'update@example.com', salary: 95000 });
    expect(res.status).toBe(200);
    expect(res.body.salary).toBe(95000);
  });

  test('returns 404 for non-existing ID', async () => {
    const res = await request(app)
      .put('/api/employees/999999')
      .set('Authorization', `Bearer ${token}`)
      .send(validEmployee);
    expect(res.status).toBe(404);
  });
});

// ── DELETE ──────────────────────────────────────────────────────────────────

describe('DELETE /api/employees/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, email: 'delete@example.com' });
    createdId = res.body.id;
  });

  test('deletes employee and returns success message', async () => {
    const res = await request(app)
      .delete(`/api/employees/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Employee deleted');
  });

  test('returns 404 for already-deleted employee', async () => {
    const res = await request(app)
      .delete(`/api/employees/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
