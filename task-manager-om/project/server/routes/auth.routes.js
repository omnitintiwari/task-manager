import express from 'express';
import {
  register,
  login,
  refreshToken,
  getProfile,
  updatePreferences,
} from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/profile', authenticateUser, getProfile);
router.patch('/preferences', authenticateUser, updatePreferences);

export default router;