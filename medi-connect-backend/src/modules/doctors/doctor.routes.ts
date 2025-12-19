import { Router } from 'express';
import { DoctorService } from './doctor.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { rbacMiddleware } from '../../middlewares/rbac.middleware';

const router = Router();

router.get(
  '/',
  authMiddleware,
  rbacMiddleware(['PATIENT', 'DOCTOR']),
  async (_req, res) => {
    const doctors = await DoctorService.getAllDoctors();
    res.json(doctors);
  }
);

export default router;
