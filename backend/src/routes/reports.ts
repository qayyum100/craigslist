import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createReport } from '../controllers/reportsController';

const router = Router();

router.post('/:listingId', authenticate, createReport);

export default router;
