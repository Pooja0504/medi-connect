import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { rbacMiddleware } from '../../middlewares/rbac.middleware';
import { AuditService } from '../audit/audit.service';
import { prisma } from '../../config/prisma';

declare global {
    namespace Express {
        interface Request {
            user?: { sub: string; role: string };
        }
    }
}

const router = Router();

router.post(
    '/patient',
    authMiddleware,
    rbacMiddleware(['PATIENT']),
    async (req, res) => {
        try {
            const { user } = req;
            const { doctorId, appointmentDate } = req.body;

            if (!doctorId || !appointmentDate) {
                return res.status(400).json({
                    code: 'MISSING_FIELD',
                    message: 'doctorId and appointmentDate are required',
                });
            }

            const appointmentTime = new Date(appointmentDate);
            if (isNaN(appointmentTime.getTime())) {
                return res.status(400).json({
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid appointmentDate format',
                });
            }

            if (appointmentTime <= new Date()) {
                return res.status(400).json({
                    code: 'VALIDATION_ERROR',
                    message: 'Appointment date must be in the future',
                });
            }

            const doctor = await prisma.user.findUnique({
                where: { id: doctorId },
            });

            if (!doctor || doctor.role !== 'DOCTOR') {
                return res.status(400).json({
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid doctor ID or user is not a doctor',
                });
            }

            const appointment = await prisma.appointment.create({
                data: {
                    patientId: user!.sub,
                    doctorId,
                    date: appointmentTime,
                },
            });

            await AuditService.log({
                actorId: user!.sub,
                actorRole: user!.role,
                action: 'Created appointment',
                resourceId: appointment.id,
            });

            res.status(201).json(appointment);
        } catch (err: any) {
            res.status(500).json({ error: err.message || 'Failed to create appointment' });
        }
    }
);

router.get(
    '/patient/upcoming',
    authMiddleware,
    rbacMiddleware(['PATIENT']),
    async (req, res) => {
        const { user } = req; // from JWT

        // Fetch appointments for this patient, only future appointments
        const upcomingAppointments = await prisma.appointment.findMany({
            where: {
                patientId: user!.sub,
                date: { gte: new Date() },
            },
            orderBy: { date: 'asc' },
            take: 20, // limit for performance
        });

        // Log the action
        await AuditService.log({
            actorId: user!.sub,
            actorRole: user!.role,
            action: 'Viewed upcoming appointments',
        });

        res.json(upcomingAppointments);
    }
);

router.get(
    '/doctor/upcoming',
    authMiddleware,
    rbacMiddleware(['DOCTOR']),
    async (req, res) => {
        const { user } = req; // from JWT

        const upcomingAppointments = await prisma.appointment.findMany({
            where: {
                doctorId: user!.sub,
                date: { gte: new Date() },
            },
            orderBy: { date: 'asc' },
            take: 20,
        });

        // Log the action
        await AuditService.log({
            actorId: user!.sub,
            actorRole: user!.role,
            action: 'Viewed upcoming appointments',
        });

        res.json(upcomingAppointments);
    }
);

export default router;
