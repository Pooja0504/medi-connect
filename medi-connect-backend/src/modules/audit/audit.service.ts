import { prisma } from '../../config/prisma'; // exact relative path

export class AuditService {
  static async log(params: {
    actorId: string;
    actorRole: string;
    action: string;
    resourceId?: string;
  }) {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorRole: params.actorRole,
        action: params.action,
        resourceId: params.resourceId,
      },
    });
  }
}
