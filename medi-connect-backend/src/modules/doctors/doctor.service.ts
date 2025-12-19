import { prisma } from '../../config/prisma';

export class DoctorService {
  static async getAllDoctors() {
    return prisma.user.findMany({
      where: {
        role: 'DOCTOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        specialization: true
      },
    });
  }
}
