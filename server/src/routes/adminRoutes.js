import express from 'express';
import {
  getDashboardStats,
  getUsers,
  getStaff,
  createStaff,
  toggleUserStatus,
  getAnalytics,
} from '../controllers/adminController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict RBAC: All admin routes require admin privileges
router.use(isAuthenticated, authorizeRoles('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/staff', getStaff);
router.post('/staff', createStaff);
router.get('/analytics', getAnalytics);

export default router;
