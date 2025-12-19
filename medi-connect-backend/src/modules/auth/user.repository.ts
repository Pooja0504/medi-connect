/**
 * User Repository - Data access layer for User entity
 * Implements repository pattern for database operations
 */

import { prisma } from '../../config/prisma';
import { PHISafeLogger } from '../../shared/logger';
import { errors, AppError } from '../../shared/errors';

export class UserRepository {
  /**
   * Find user by email
   */
  static async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (err) {
      PHISafeLogger.error('Error finding user by email', { error: String(err) });
      throw errors.databaseError();
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (err) {
      PHISafeLogger.error('Error finding user by ID', { error: String(err) });
      throw errors.databaseError();
    }
  }

  /**
   * Create new user
   */
  static async create(data: { name: string; email: string; password: string; role: string; specialization?: string }) {
    try {
      return await prisma.user.create({
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          specialization: true,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw errors.alreadyExists('User with this email');
      }
      PHISafeLogger.error('Error creating user', { error: String(err) });
      throw errors.databaseError();
    }
  }

  /**
   * Get all doctors
   */
  static async findAllDoctors() {
    try {
      return await prisma.user.findMany({
        where: { role: 'DOCTOR' },
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
        },
      });
    } catch (err) {
      PHISafeLogger.error('Error fetching doctors', { error: String(err) });
      throw errors.databaseError();
    }
  }

  /**
   * Find all patients
   */
  static async findAllPatients() {
    try {
      return await prisma.user.findMany({
        where: { role: 'PATIENT' },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } catch (err) {
      PHISafeLogger.error('Error fetching patients', { error: String(err) });
      throw errors.databaseError();
    }
  }
}
