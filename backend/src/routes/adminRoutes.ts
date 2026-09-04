import { Router } from 'express';
import {
  getAdminOverview,
  getPendingWorkers,
  verifyWorker,
  getAllUsers,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { adminVerifyWorkerSchema } from '../utils/validators';

const router = Router();

// All routes require ADMIN role
router.use(authenticate, requireRole(['ADMIN']));

router.get('/overview', getAdminOverview);
router.get('/workers', getPendingWorkers);
router.patch('/workers/:workerId/verify', validate(adminVerifyWorkerSchema), verifyWorker);
router.get('/users', getAllUsers);

export default router;
