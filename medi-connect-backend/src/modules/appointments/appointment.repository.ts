/**
 * Appointment Repository - Data access layer for Appointment entity
 */

import { prisma } from '../../config/prisma';
import { PHISafeLogger } from '../../shared/logger';
import { errors } from '../../shared/errors';

export class AppointmentRepository {
  /**
   * Create appointment
   */
  static async create(data: { patientId: string; doctorId: string; date: Date }) {
    try {
      return await prisma.appointment.create({
        data,
      });
    } catch (err) {
      PHISafeLogger.error('Error creating appointment', { error: String(err) });
      throw errors.databaseError();
    }
  }

  /**
   * Find appointment by ID
   */
  static async findById(id: string) {
    try {
      return await prisma.appointment.findUnique({
        where: { id },
      });
    } catch (err) {
      PHISafeLogger.error('Error finding appointment', { error: String(err) });
      throw errors.databaseError();
    }
  }

  /**
   * Get upcoming appointments for patient
   */
  static async findUpcomingForPatient(patientId: string, limit: number = 20) {
    try {
      return await prisma.appointment.findMany({
        where: {
          patientId,
          date: { gte: new Date() },
        },
        orderBy: { date: 'asc' },
        take: limit,
      });
    } catch (err) {
      PHISafeLogger.error('Error fetching patient appointments', { error: String(err) });
      throw errors.databaseError();
    }
  }

  /**
   * Get upcoming appointments for doctor
   */
  static async findUpcomingForDoctor(doctorId: string, limit: number = 20) {
    try {
      return await prisma.appointment.findMany({
        where: {
          doctorId,
          date: { gte: new Date() },
        },
        orderBy: { date: 'asc' },
        take: limit,
      });
    } catch (err) {
      PHISafeLogger.error('Error fetching doctor appointments', { error: String(err) });
      throw errors.databaseError();
    }
  }
}
