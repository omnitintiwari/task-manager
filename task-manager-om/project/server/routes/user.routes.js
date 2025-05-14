import express from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(authenticateUser);

// Example admin-only route
router.get('/', authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message,
    });
  }
});

export default router;