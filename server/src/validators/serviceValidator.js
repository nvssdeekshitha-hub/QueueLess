import { sendError } from '../utils/responseHelper.js';

export const validateService = (req, res, next) => {
  const { name, code, description, estimatedDurationMin, slotCapacity, operatingHours } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      errors.push({ field: 'name', message: 'Service name must be at least 3 characters' });
    }
    if (!code || typeof code !== 'string' || code.trim().length < 2) {
      errors.push({ field: 'code', message: 'Service code must be at least 2 characters (e.g. REC)' });
    }
    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      errors.push({ field: 'description', message: 'Description must be at least 5 characters' });
    }
  } else {
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 3)) {
      errors.push({ field: 'name', message: 'Service name must be at least 3 characters' });
    }
    if (code !== undefined && (typeof code !== 'string' || code.trim().length < 2)) {
      errors.push({ field: 'code', message: 'Service code must be at least 2 characters' });
    }
    if (description !== undefined && (typeof description !== 'string' || description.trim().length < 5)) {
      errors.push({ field: 'description', message: 'Description must be at least 5 characters' });
    }
  }

  if (estimatedDurationMin !== undefined && (isNaN(estimatedDurationMin) || estimatedDurationMin < 5 || estimatedDurationMin > 180)) {
    errors.push({ field: 'estimatedDurationMin', message: 'Estimated duration must be between 5 and 180 minutes' });
  }

  if (slotCapacity !== undefined && (isNaN(slotCapacity) || slotCapacity < 1 || slotCapacity > 50)) {
    errors.push({ field: 'slotCapacity', message: 'Slot capacity must be between 1 and 50' });
  }

  if (operatingHours) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (operatingHours.start && !timeRegex.test(operatingHours.start)) {
      errors.push({ field: 'operatingHours.start', message: 'Start time must be formatted as HH:MM' });
    }
    if (operatingHours.end && !timeRegex.test(operatingHours.end)) {
      errors.push({ field: 'operatingHours.end', message: 'End time must be formatted as HH:MM' });
    }
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation error', 400, errors);
  }

  next();
};
