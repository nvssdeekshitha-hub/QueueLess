import Appointment from '../models/Appointment.js';
import { bookAppointmentService, updateTokenStatusService } from '../services/queueService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/responseHelper.js';

/**
 * Get appointments list with role-based filtering and pagination
 * GET /api/appointments
 */
export const getAppointments = async (req, res, next) => {
  try {
    const { date, status, serviceId, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Role-based isolation: Students only see their own appointments
    if (req.user.role === 'student') {
      filter.user = req.user._id;
    }

    if (date) {
      filter.appointmentDate = date;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (serviceId) {
      filter.service = serviceId;
    }

    if (search) {
      filter.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { tokenNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('service', 'name code counterName estimatedDurationMin')
        .populate('user', 'name email studentId phone')
        .sort({ appointmentDate: -1, tokenSequence: -1 })
        .skip(skip)
        .limit(limitNum),
      Appointment.countDocuments(filter),
    ]);

    return sendPaginated(res, appointments, total, pageNum, limitNum, 'Appointments fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single appointment by ID
 * GET /api/appointments/:id
 */
export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('service', 'name code counterName estimatedDurationMin operatingHours')
      .populate('user', 'name email studentId phone')
      .populate('servedBy', 'name email');

    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    // Role safety: Students can only view their own appointment
    if (req.user.role === 'student' && !appointment.user._id.equals(req.user._id)) {
      return sendError(res, 'Access denied. You do not own this appointment.', 403);
    }

    return sendSuccess(res, appointment, 'Appointment details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Book a new appointment
 * POST /api/appointments
 */
export const bookAppointment = async (req, res, next) => {
  try {
    const { serviceId, appointmentDate, timeSlot, notes } = req.body;

    // Concurrency-safe atomic booking
    const appointment = await bookAppointmentService({
      userId: req.user._id,
      serviceId,
      appointmentDate,
      timeSlot,
      notes,
    });

    return sendSuccess(res, appointment, 'Appointment booked successfully! Your token has been issued.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an appointment
 * PATCH /api/appointments/:id/cancel
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    // Ownership check for students
    if (req.user.role === 'student' && !appointment.user.equals(req.user._id)) {
      return sendError(res, 'Access denied. You can only cancel your own appointments.', 403);
    }

    // Check if cancellation is allowed for current state
    if (!['booked', 'waiting'].includes(appointment.status)) {
      return sendError(
        res,
        `Cannot cancel an appointment that is already ${appointment.status}. Only booked or waiting appointments can be cancelled.`,
        400
      );
    }

    const updated = await updateTokenStatusService(
      id,
      'cancelled',
      req.user._id,
      reason || 'Cancelled by user'
    );

    return sendSuccess(res, updated, 'Appointment cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an appointment permanently (Admin only)
 * DELETE /api/appointments/:id
 */
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    return sendSuccess(res, null, 'Appointment deleted successfully');
  } catch (error) {
    next(error);
  }
};
