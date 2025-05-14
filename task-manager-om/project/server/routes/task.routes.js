import express from 'express';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../controllers/task.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(authenticateUser);

// Routes
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/reorder', reorderTasks);

export default router;