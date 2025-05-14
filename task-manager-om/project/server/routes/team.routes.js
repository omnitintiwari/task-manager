import express from 'express';
import {
  createTeam,
  getTeams,
  getTeam,
  addMember,
  removeMember,
} from '../controllers/team.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(authenticateUser);

// Routes
router.post('/', createTeam);
router.get('/', getTeams);
router.get('/:id', getTeam);
router.post('/:id/members', addMember);
router.delete('/:id/members', removeMember);

export default router;