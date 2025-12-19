import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/prisma';
import bcrypt from 'bcrypt';

describe('Auth Module - Integration Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a patient successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Patient',
          email: 'john@example.com',
          password: 'SecurePass123',
          role: 'PATIENT',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body.role).toBe('PATIENT');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should register a doctor with specialization', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Dr. Jane Smith',
          email: 'jane@example.com',
          password: 'SecurePass123',
          role: 'DOCTOR',
          specialization: 'Cardiologist',
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('DOCTOR');
      expect(response.body.specialization).toBe('Cardiologist');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Invalid User',
          email: 'not-an-email',
          password: 'SecurePass123',
          role: 'PATIENT',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'short',
          role: 'PATIENT',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@example.com',
          password: 'SecurePass123',
          role: 'PATIENT',
        });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'SecurePass123',
          role: 'PATIENT',
        });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('ALREADY_EXISTS');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Incomplete User',
          email: 'incomplete@example.com',
          // missing password
          role: 'PATIENT',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('MISSING_FIELD');
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Login Test User',
          email: 'login@example.com',
          password: 'TestPass123',
          role: 'PATIENT',
        });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'TestPass123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresIn');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPass123',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject wrong password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should not leak sensitive data in error messages', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).not.toContain('test@example.com');
    });
  });
});
