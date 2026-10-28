import { sendError } from '../utils/responseHelper.js';

export const validateAppointmentBooking = (req, res, next) => {
  const { serviceId, appointmentDate, timeSlot } = req.body;
  const errors = [];

  if (!serviceId) {
    errors.push({ field: 'serviceId', message: 'Service ID is required' });
  }

  if (!appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
    errors.push({ field: 'appointmentDate', message: 'Appointment date is required in YYYY-MM-DD format' });
  } else {
    // Check that appointment date is not in the past
    const todayStr = new Date().toISOString().slice(0, 10);
    if (appointmentDate < todayStr) {
      errors.push({ field: 'appointmentDate', message: 'Cannot book appointments for past dates' });
    }
  }

  if (!timeSlot || typeof timeSlot !== 'string' || timeSlot.trim().length === 0) {
    errors.push({ field: 'timeSlot', message: 'Time slot is required (e.g. 10:00 - 10:30)' });
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation error', 400, errors);
  }

  next();
};

export const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['booked', 'waiting', 'serving', 'completed', 'skipped', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return sendError(
      res,
      `Invalid status. Must be one of: [${validStatuses.join(', ')}]`,
      400
    );
  }

  next();
};
