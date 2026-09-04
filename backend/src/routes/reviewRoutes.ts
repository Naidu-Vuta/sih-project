import { Router } from 'express';
import { createReview, getWorkerReviews } from '../controllers/reviewController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../utils/validators';

const router = Router();

router.get('/worker/:workerId', getWorkerReviews);
router.post(
  '/',
  authenticate,
  requireRole(['CUSTOMER']),
  validate(createReviewSchema),
  createReview
);

export default router;
