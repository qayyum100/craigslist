import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { register, login, getMe, updateProfile, forgotPassword, resetPassword } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateProfile);

export default router;
