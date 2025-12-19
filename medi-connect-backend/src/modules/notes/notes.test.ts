import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/prisma';

describe('Notes Module - Integration Tests', () => {
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
        name: 'Note Patient',
        email: 'note-patient@example.com',
        password: 'NotePatientPass123',
        role: 'PATIENT',
      });
    patientId = patientRes.body.id;

    // Create test doctor
    const doctorRes = await request(app)
      .post('/auth/register')
      .send({
        name: 'Dr. Notes',
        email: 'doctor-notes@example.com',
        password: 'DoctorNotesPass123',
        role: 'DOCTOR',
        specialization: 'Cardiology',
      });
    doctorId = doctorRes.body.id;

    // Login to get tokens
    const patientLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'note-patient@example.com',
        password: 'NotePatientPass123',
      });
    patientToken = patientLogin.body.token;

    const doctorLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'doctor-notes@example.com',
        password: 'DoctorNotesPass123',
      });
    doctorToken = doctorLogin.body.token;

    // Create an appointment
    const appointmentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const appointmentRes = await request(app)
      .post('/appointments/patient')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorId,
        appointmentDate: appointmentDate,
        reason: 'Checkup',
      });
    appointmentId = appointmentRes.body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /notes', () => {
    it('should create a clinical note successfully', async () => {
      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: appointmentId,
          content: 'Patient presents with chest discomfort. EKG shows normal sinus rhythm. Prescribed aspirin and advised to follow up.',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.patientId).toBe(patientId);
      expect(response.body.doctorId).toBe(doctorId);
    });

    it('should reject note with content too short', async () => {
      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: appointmentId,
          content: 'Too short',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject note with invalid appointment ID', async () => {
      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: 'invalid-id',
          content: 'This is a valid clinical note with sufficient length for validation.',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject patient creating notes (RBAC)', async () => {
      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          appointmentId: appointmentId,
          content: 'Patient trying to create note - should fail with sufficient length check.',
        });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should reject unauthorized request without token', async () => {
      const response = await request(app)
        .post('/notes')
        .send({
          appointmentId: appointmentId,
          content: 'Unauthorized note attempt without proper authentication token validation.',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should reject note for appointment not owned by doctor', async () => {
      // Create another patient and doctor
      const otherDoctorRes = await request(app)
        .post('/auth/register')
        .send({
          name: 'Dr. Other',
          email: 'other-doctor@example.com',
          password: 'OtherDoctorPass123',
          role: 'DOCTOR',
          specialization: 'Neurology',
        });
      const otherDoctorId = otherDoctorRes.body.id;

      const otherDoctorLogin = await request(app)
        .post('/auth/login')
        .send({
          email: 'other-doctor@example.com',
          password: 'OtherDoctorPass123',
        });
      const otherDoctorToken = otherDoctorLogin.body.token;

      const response = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${otherDoctorToken}`)
        .send({
          appointmentId: appointmentId,
          content: 'Doctor trying to add note to another doctors appointment should be rejected.',
        });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /notes/:appointmentId', () => {
    let noteId: string;

    beforeAll(async () => {
      // Create a note first
      const noteRes = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: appointmentId,
          content: 'Patient presents with chronic migraines. Prescribed sumatriptan. Follow-up in two weeks.',
        });
      noteId = noteRes.body.id;
    });

    it('should retrieve clinical notes for an appointment', async () => {
      const response = await request(app)
        .get(`/notes/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('content');
        expect(response.body[0]).toHaveProperty('doctorId');
      }
    });

    it('should reject unauthorized note retrieval', async () => {
      const response = await request(app)
        .get(`/notes/${appointmentId}`);

      expect(response.status).toBe(401);
    });
  });
});
