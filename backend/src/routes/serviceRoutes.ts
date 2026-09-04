import { Router } from 'express';
import { getCategories, getServices, getServiceById, createService } from '../controllers/serviceController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createServiceSchema } from '../utils/validators';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', authenticate, requireRole(['ADMIN']), validate(createServiceSchema), createService);

export default router;
