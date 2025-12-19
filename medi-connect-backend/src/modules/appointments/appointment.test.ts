import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/prisma';

describe('Appointments Module - Integration Tests', () => {
  let patientToken: string;
  let doctorToken: string;
  let appointmentId: string;
  let patientId: string;
  let doctorId: string;

  beforeAll(async () => {
    // Create test patient
    const patientRes = await request(app)
      .post('/auth/register')
      .send({
        name: 'Patient Test',
        email: 'patient-test@example.com',
        password: 'PatientPass123',
        role: 'PATIENT',
      });
    patientId = patientRes.body.id;

    // Create test doctor
    const doctorRes = await request(app)
      .post('/auth/register')
      .send({
        name: 'Dr. Test',
        email: 'doctor-test@example.com',
        password: 'DoctorPass123',
        role: 'DOCTOR',
        specialization: 'General',
      });
    doctorId = doctorRes.body.id;

    // Login to get tokens
    const patientLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'patient-test@example.com',
        password: 'PatientPass123',
      });
    patientToken = patientLogin.body.token;

    const doctorLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'doctor-test@example.com',
        password: 'DoctorPass123',
      });
    doctorToken = doctorLogin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /appointments/patient', () => {
    it('should create an appointment successfully', async () => {
      const appointmentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .post('/appointments/patient')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctorId,
          appointmentDate: appointmentDate,
          reason: 'General checkup',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.patientId).toBe(patientId);
      expect(response.body.doctorId).toBe(doctorId);
      appointmentId = response.body.id;
    });

    it('should reject appointment in the past', async () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();

      const response = await request(app)
        .post('/appointments/patient')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctorId,
          appointmentDate: pastDate,
          reason: 'General checkup',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid doctor ID', async () => {
      const appointmentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .post('/appointments/patient')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: 'invalid-id',
          appointmentDate: appointmentDate,
          reason: 'General checkup',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject doctor as patient (RBAC)', async () => {
      const appointmentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .post('/appointments/patient')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          doctorId: doctorId,
          appointmentDate: appointmentDate,
          reason: 'General checkup',
        });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should reject unauthorized request without token', async () => {
      const appointmentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .post('/appointments/patient')
        .send({
          doctorId: doctorId,
          appointmentDate: appointmentDate,
          reason: 'General checkup',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /appointments/patient/upcoming', () => {
    it('should retrieve patient upcoming appointments', async () => {
      const response = await request(app)
        .get('/appointments/patient/upcoming')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('doctorId');
    });

    it('should reject unauthorized access', async () => {
      const response = await request(app)
        .get('/appointments/patient/upcoming');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /appointments/doctor/upcoming', () => {
    it('should retrieve doctor upcoming appointments', async () => {
      const response = await request(app)
        .get('/appointments/doctor/upcoming')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject patient access (RBAC)', async () => {
      const response = await request(app)
        .get('/appointments/doctor/upcoming')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });
});
