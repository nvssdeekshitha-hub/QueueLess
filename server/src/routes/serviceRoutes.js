import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateService } from '../validators/serviceValidator.js';

const router = express.Router();

// Public routes for browsing services
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin-only management routes
router.post('/', isAuthenticated, authorizeRoles('admin'), validateService, createService);
router.patch('/:id', isAuthenticated, authorizeRoles('admin'), validateService, updateService);
router.delete('/:id', isAuthenticated, authorizeRoles('admin'), deleteService);

export default router;
