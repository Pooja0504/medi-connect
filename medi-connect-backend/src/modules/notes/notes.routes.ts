import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { rbacMiddleware } from '../../middlewares/rbac.middleware';
import { AuditService } from '../audit/audit.service';
import { prisma } from '../../config/prisma';

const router = Router();

router.get(
    '/patient/:patientId',
    authMiddleware,
    rbacMiddleware(['DOCTOR']),
    async (req, res) => {
        const { user } = req;
        const { patientId } = req.params;

        const notes = await prisma.note.findMany({
            where: {
                doctorId: user!.sub,
                patientId,
            },
            orderBy: { createdAt: 'desc' },
        });

        await AuditService.log({
            actorId: user!.sub,
            actorRole: user!.role,
            action: `Viewed notes for patient ${patientId}`,
        });

        res.json(notes);
    }
);

router.post(
    '/',
    authMiddleware,
    rbacMiddleware(['DOCTOR']),
    async (req, res) => {
        try {
            const { user } = req;
            const { appointmentId, content } = req.body;

            if (!appointmentId || !content) {
                return res.status(400).json({
                    code: 'MISSING_FIELD',
                    message: 'appointmentId and content are required',
                });
            }

            if (typeof content !== 'string' || content.length < 10) {
                return res.status(400).json({
                    code: 'VALIDATION_ERROR',
                    message: 'Content must be at least 10 characters long',
                });
            }

            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
            });

            if (!appointment) {
                return res.status(400).json({
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid appointment ID',
                });
            }

            if (appointment.doctorId !== user!.sub) {
                return res.status(403).json({
                    code: 'UNAUTHORIZED',
                    message: 'Unauthorized to add note to this appointment',
                });
            }

            const note = await prisma.note.create({
                data: {
                    doctorId: user!.sub,
                    patientId: appointment.patientId,
                    appointmentId,
                    content,
                },
            });

            await AuditService.log({
                actorId: user!.sub,
                actorRole: user!.role,
                action: 'Added clinical note',
                resourceId: note.id,
            });

            res.status(201).json(note);
        } catch (err: any) {
            console.error('Error creating note:', err);
            res.status(500).json({ error: err.message || 'Failed to create note' });
        }
    }
);

router.get(
    '/:appointmentId',
    authMiddleware,
    async (req, res) => {
        try {
            const { user } = req;
            const { appointmentId } = req.params;

            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
            });

            if (!appointment) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            const isAuthorized = user!.role === 'DOCTOR' && appointment.doctorId === user!.sub;
            const isPatient = user!.role === 'PATIENT' && appointment.patientId === user!.sub;

            if (!isAuthorized && !isPatient) {
                return res.status(403).json({ error: 'Unauthorized to view notes for this appointment' });
            }

            const notes = await prisma.note.findMany({
                where: { appointmentId },
                orderBy: { createdAt: 'desc' },
            });

            await AuditService.log({
                actorId: user!.sub,
                actorRole: user!.role,
                action: 'Viewed notes for appointment',
                resourceId: appointmentId,
            });

            res.json(notes);
        } catch (err: any) {
            console.error('Error retrieving notes:', err);
            res.status(500).json({ error: err.message || 'Failed to retrieve notes' });
        }
    }
);

export default router;
