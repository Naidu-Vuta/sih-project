import { Router } from 'express';
import {
  getWorkerStats,
  toggleAvailability,
  updateWorkerProfile,
  updateWorkerSchedule,
  getPublicWorkers,
  getWorkerProfileById,
  getWorkerEarningsAnalytics,
} from '../controllers/workerController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  workerAvailabilitySchema,
  workerProfileUpdateSchema,
  workerScheduleUpdateSchema,
} from '../utils/validators';

const router = Router();

// Public verified workers search directory & profile
router.get('/public', getPublicWorkers);
router.get('/profile/:id', getWorkerProfileById);

// Worker authenticated dashboard statistics
router.get('/stats', authenticate, requireRole(['WORKER']), getWorkerStats);

// Worker earnings analytics (daily, weekly, monthly, total, ledger)
router.get('/earnings', authenticate, requireRole(['WORKER']), getWorkerEarningsAnalytics);

// Toggle worker availability
router.patch(
  '/availability',
  authenticate,
  requireRole(['WORKER']),
  validate(workerAvailabilitySchema),
  toggleAvailability
);

// Update worker profile
router.put(
  '/profile',
  authenticate,
  requireRole(['WORKER']),
  validate(workerProfileUpdateSchema),
  updateWorkerProfile
);

// Update worker schedule & unavailable dates
router.put(
  '/schedule',
  authenticate,
  requireRole(['WORKER']),
  validate(workerScheduleUpdateSchema),
  updateWorkerSchedule
);

export default router;
