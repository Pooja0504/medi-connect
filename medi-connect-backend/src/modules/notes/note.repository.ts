/**
 * Note Repository - Data access layer for Note entity
 */

import { prisma } from '../../config/prisma';
import { PHISafeLogger } from '../../shared/logger';
import { errors } from '../../shared/errors';

export class NoteRepository {
  /**
   * Create clinical note
   */
  static async create(data: { doctorId: string; patientId: string; appointmentId: string; content: string }) {
    try {
      return await prisma.note.create({
        data,
      });
    } catch (err) {
      PHISafeLogger.error('Error creating note', { error: String(err) });
      throw errors.databaseError();
    }
  }

  /**
   * Find notes for patient by doctor
   */
  static async findByPatientAndDoctor(patientId: string, doctorId: string) {
    try {
      return await prisma.note.findMany({
        where: {
          patientId,
          doctorId,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      PHISafeLogger.error('Error fetching notes', { error: String(err) });
      throw errors.databaseError();
    }
  }

  /**
   * Find all notes for patient
   */
  static async findByPatient(patientId: string) {
    try {
      return await prisma.note.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      PHISafeLogger.error('Error fetching patient notes', { error: String(err) });
      throw errors.databaseError();
    }
  }

  /**
   * Find note by appointment
   */
  static async findByAppointment(appointmentId: string) {
    try {
      return await prisma.note.findMany({
        where: { appointmentId },
      });
    } catch (err) {
      PHISafeLogger.error('Error fetching appointment notes', { error: String(err) });
      throw errors.databaseError();
    }
  }
}
