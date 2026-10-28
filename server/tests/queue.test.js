import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Service from '../src/models/Service.js';
import Appointment from '../src/models/Appointment.js';
import './setup.js';

describe('Queue Booking & Workflow Tests', () => {
  let studentAgent;
  let staffAgent;
  let testService;
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  beforeEach(async () => {
    // 1. Create service with slotCapacity = 2 for tight testing
    testService = await Service.create({
      name: 'Records Section',
      code: 'REC',
      description: 'Records service',
      category: 'Academic',
      counterName: 'Counter 1',
      estimatedDurationMin: 15,
      slotCapacity: 2,
      operatingHours: { start: '09:00', end: '17:00' },
    });

    // 2. Create student & staff sessions
    studentAgent = request.agent(app);
    await studentAgent.post('/api/auth/register').send({
      name: 'John Student',
      email: 'john@queueless.edu',
      password: 'Password123!',
      studentId: 'STU101',
    });

    await User.create({
      name: 'Officer Jane',
      email: 'jane.staff@queueless.edu',
      password: 'StaffPassword123!',
      role: 'staff',
    });

    staffAgent = request.agent(app);
    await staffAgent.post('/api/auth/login').send({
      email: 'jane.staff@queueless.edu',
      password: 'StaffPassword123!',
    });
  });

  it('should book an appointment, generate token REC-001 and valid reference', async () => {
    const res = await studentAgent.post('/api/appointments').send({
      serviceId: testService._id,
      appointmentDate: tomorrowStr,
      timeSlot: '10:00 - 10:30',
      notes: 'Need bonafide letter',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokenNumber).toBe('REC-001');
    expect(res.body.data.tokenSequence).toBe(1);
    expect(res.body.data.bookingReference).toMatch(/^QL-\d{8}-[A-Z0-9]{4}$/);
    expect(res.body.data.status).toBe('booked');
  });

  it('should reject booking when slot capacity is exceeded (Concurrency Safety)', async () => {
    // Book slot capacity (2 bookings)
    await studentAgent.post('/api/appointments').send({
      serviceId: testService._id,
      appointmentDate: tomorrowStr,
      timeSlot: '11:00 - 11:30',
    });

    await studentAgent.post('/api/appointments').send({
      serviceId: testService._id,
      appointmentDate: tomorrowStr,
      timeSlot: '11:00 - 11:30',
    });

    // 3rd booking should be rejected with 409 Conflict
    const thirdBooking = await studentAgent.post('/api/appointments').send({
      serviceId: testService._id,
      appointmentDate: tomorrowStr,
      timeSlot: '11:00 - 11:30',
    });

    expect(thirdBooking.status).toBe(409);
    expect(thirdBooking.body.success).toBe(false);
    expect(thirdBooking.body.message).toContain('full capacity');
  });

  it('should accurately calculate queue position and estimated wait time', async () => {
    // Student 1 books
    const res1 = await studentAgent.post('/api/appointments').send({
      serviceId: testService._id,
      appointmentDate: tomorrowStr,
      timeSlot: '09:00 - 09:30',
    });

    // Student 2 books
    const res2 = await studentAgent.post('/api/appointments').send({
      serviceId: testService._id,
      appointmentDate: tomorrowStr,
      timeSlot: '09:30 - 10:00',
    });

    const token2Id = res2.body.data._id;

    // Check status of Token 2
    const statusRes = await request(app).get(`/api/queue/token/${token2Id}`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.positionAhead).toBe(1); // Token 1 is ahead
    expect(statusRes.body.data.estimatedWaitMin).toBe(15); // 1 ahead * 15 min
  });

  it('should allow staff to call next token and progress through state workflow', async () => {
    const todayStr = new Date().toISOString().slice(0, 10);

    // Book appointment for today
    const bookRes = await studentAgent.post('/api/appointments').send({
      serviceId: testService._id,
      appointmentDate: todayStr,
      timeSlot: '12:00 - 12:30',
    });
    const appointmentId = bookRes.body.data._id;

    // 1. Staff calls next
    const callRes = await staffAgent.post(`/api/queue/${testService._id}/next`);
    expect(callRes.status).toBe(200);
    expect(callRes.body.data.status).toBe('waiting');

    // 2. Staff starts serving
    const servingRes = await staffAgent
      .patch(`/api/queue/token/${appointmentId}/status`)
      .send({ status: 'serving' });
    expect(servingRes.status).toBe(200);
    expect(servingRes.body.data.status).toBe('serving');

    // 3. Staff completes appointment
    const completeRes = await staffAgent
      .patch(`/api/queue/token/${appointmentId}/status`)
      .send({ status: 'completed' });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe('completed');

    // 4. Invalid transition from completed to waiting should be rejected
    const invalidRes = await staffAgent
      .patch(`/api/queue/token/${appointmentId}/status`)
      .send({ status: 'waiting' });
    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.message).toContain('Invalid status transition');
  });
});
