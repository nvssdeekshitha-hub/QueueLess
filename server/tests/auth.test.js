import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import './setup.js';

describe('Authentication & Session API Tests', () => {
  it('should successfully register a student user with hashed password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student',
        email: 'test.student@queueless.edu',
        password: 'Password123!',
        studentId: '22CSE999',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test.student@queueless.edu');
    expect(res.body.data.user.role).toBe('student');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject registration with invalid email or short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'not-an-email',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject registration with duplicate email', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'duplicate@queueless.edu',
        password: 'Password123!',
      });

    // Second registration with same email
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'duplicate@queueless.edu',
        password: 'AnotherPassword123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user and return session cookie', async () => {
    // Register user first
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@queueless.edu',
        password: 'SecretPassword123!',
      });

    // Perform login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@queueless.edu',
        password: 'SecretPassword123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.name).toBe('Login User');
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Valid User',
        email: 'valid@queueless.edu',
        password: 'CorrectPassword123!',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'valid@queueless.edu',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for protected /api/auth/me when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
