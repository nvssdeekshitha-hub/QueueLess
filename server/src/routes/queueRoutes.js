import express from 'express';
import {
  getQueue,
  getTokenStatus,
  callNext,
  updateStatus,
} from '../controllers/queueController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateStatusUpdate } from '../validators/appointmentValidator.js';

const router = express.Router();

// Queue and token tracking (accessible to logged-in users and public queue displays)
router.get('/:serviceId', getQueue);
router.get('/token/:tokenId', getTokenStatus);

// Staff and Admin queue control endpoints
router.post('/:serviceId/next', isAuthenticated, authorizeRoles('staff', 'admin'), callNext);
router.patch('/token/:tokenId/status', isAuthenticated, authorizeRoles('staff', 'admin'), validateStatusUpdate, updateStatus);

export default router;
