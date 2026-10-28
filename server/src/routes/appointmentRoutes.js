import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  bookAppointment,
  cancelAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateAppointmentBooking } from '../validators/appointmentValidator.js';

const router = express.Router();

router.use(isAuthenticated); // All appointment endpoints require authentication

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', validateAppointmentBooking, bookAppointment);
router.patch('/:id/cancel', cancelAppointment);
router.delete('/:id', authorizeRoles('admin'), deleteAppointment);

export default router;
