import { Router } from 'express';
import {
  getSavedWorkers,
  toggleSaveWorker,
  getNotifications,
  markNotificationRead,
  getPaymentHistory,
} from '../controllers/customerController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Saved workers
router.get('/saved-workers', requireRole(['CUSTOMER']), getSavedWorkers);
router.post('/saved-workers', requireRole(['CUSTOMER']), toggleSaveWorker);

// Notifications (Customer & Worker)
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

// Payment history
router.get('/payment-history', requireRole(['CUSTOMER']), getPaymentHistory);

export default router;
