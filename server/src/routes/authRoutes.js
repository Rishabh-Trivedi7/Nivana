import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  uploadAvatar,
} from '../controllers/authController.js';
import authenticate from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} from '../validators/authValidators.js';

const router = Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, validate, updateProfile);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
