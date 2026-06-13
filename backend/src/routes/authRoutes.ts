import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/authValidator';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, registerValidator, validateRequest, register);
router.post('/login', authLimiter, loginValidator, validateRequest, login);

router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfileValidator, validateRequest, updateProfile);
router.patch(
  '/change-password',
  protect,
  changePasswordValidator,
  validateRequest,
  changePassword
);

export default router;
