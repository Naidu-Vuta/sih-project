import { Router } from 'express';
import {
  createBooking,
  getCustomerBookings,
  getWorkerBookings,
  updateBookingStatus,
} from '../controllers/bookingController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBookingSchema, updateBookingStatusSchema } from '../utils/validators';

const router = Router();

// Customer creates booking
router.post(
  '/',
  authenticate,
  requireRole(['CUSTOMER']),
  validate(createBookingSchema),
  createBooking
);

// Customer views their bookings
router.get(
  '/my-bookings',
  authenticate,
  requireRole(['CUSTOMER']),
  getCustomerBookings
);

// Worker views their assigned bookings & open requests
router.get(
  '/worker-jobs',
  authenticate,
  requireRole(['WORKER']),
  getWorkerBookings
);

// Update booking status (accept, start, complete, cancel)
router.patch(
  '/:id/status',
  authenticate,
  validate(updateBookingStatusSchema),
  updateBookingStatus
);

export default router;
