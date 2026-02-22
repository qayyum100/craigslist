import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import {
    getAllListings,
    approveListing,
    rejectListing,
    getAllReports,
    resolveReport,
    getAdminStats,
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/listings', getAllListings);
router.put('/listings/:id/approve', approveListing);
router.put('/listings/:id/reject', rejectListing);
router.get('/reports', getAllReports);
router.put('/reports/:id/resolve', resolveReport);

export default router;
