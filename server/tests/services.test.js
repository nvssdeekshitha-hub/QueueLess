import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Service from '../src/models/Service.js';
import './setup.js';

describe('Services API & Authorization Tests', () => {
  it('should list active services without authentication', async () => {
    await Service.create({
      name: 'Fee Payment Counter',
      code: 'FEE',
      description: 'Counter for tuition fee clearance',
      category: 'Financial',
      counterName: 'Counter 2',
      estimatedDurationMin: 15,
      slotCapacity: 5,
    });

    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].code).toBe('FEE');
  });

  it('should deny non-admin users from creating a service (RBAC)', async () => {
    // 1. Create and log in as student
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({
      name: 'Student User',
      email: 'student.rbac@queueless.edu',
      password: 'Password123!',
    });

    // 2. Attempt admin action
    const res = await agent.post('/api/services').send({
      name: 'Unauthorized Service',
      code: 'UNAUTH',
      description: 'Should be rejected',
      category: 'General',
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin to create and update a service', async () => {
    // 1. Create admin user directly in DB
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin.service@queueless.edu',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    // 2. Log in with admin
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({
      email: 'admin.service@queueless.edu',
      password: 'AdminPassword123!',
    });

    // 3. Admin creates service
    const createRes = await agent.post('/api/services').send({
      name: 'Certificates Section',
      code: 'CERT',
      description: 'Official university transcripts',
      category: 'Academic',
      counterName: 'Counter 1',
      estimatedDurationMin: 10,
      slotCapacity: 3,
      operatingHours: { start: '09:00', end: '12:00' },
    });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.code).toBe('CERT');
    const serviceId = createRes.body.data._id;

    // 4. Admin updates service
    const updateRes = await agent.patch(`/api/services/${serviceId}`).send({
      name: 'Certificates & Transcripts Section',
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Certificates & Transcripts Section');
  });
});
