import Service from '../models/Service.js';
import Appointment from '../models/Appointment.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

/**
 * Generate standard 30-minute time slots between start and end time
 */
const generateTimeSlots = (startStr, endStr) => {
  const slots = [];
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + 30 <= endMinutes) {
    const sH = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
    const sM = String(currentMinutes % 60).padStart(2, '0');
    const eMinutes = currentMinutes + 30;
    const eH = String(Math.floor(eMinutes / 60)).padStart(2, '0');
    const eM = String(eMinutes % 60).padStart(2, '0');

    slots.push(`${sH}:${sM} - ${eH}:${eM}`);
    currentMinutes += 30;
  }

  return slots;
};

/**
 * Get all services
 * GET /api/services
 */
export const getServices = async (req, res, next) => {
  try {
    const { category, search, includeInactive } = req.query;
    const filter = {};

    // Only administrators can query inactive services
    if (!includeInactive || req.user?.role !== 'admin') {
      filter.isActive = true;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(filter)
      .populate('assignedStaff', 'name email department')
      .sort({ name: 1 });

    return sendSuccess(res, services, 'Services retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single service details with slot availability for a specific date
 * GET /api/services/:id
 */
export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const service = await Service.findById(id).populate('assignedStaff', 'name email department');
    if (!service) {
      return sendError(res, 'Service not found', 404);
    }

    // If date is provided, calculate slot capacities
    let availableSlots = [];
    if (date) {
      const generated = generateTimeSlots(
        service.operatingHours?.start || '09:00',
        service.operatingHours?.end || '17:00'
      );

      // Aggregate bookings per slot for this service and date
      const bookings = await Appointment.aggregate([
        {
          $match: {
            service: service._id,
            appointmentDate: date,
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: '$timeSlot',
            count: { $sum: 1 },
          },
        },
      ]);

      const bookingMap = new Map();
      bookings.forEach((b) => bookingMap.set(b._id, b.count));

      availableSlots = generated.map((slot) => {
        const booked = bookingMap.get(slot) || 0;
        const available = Math.max(0, service.slotCapacity - booked);
        return {
          timeSlot: slot,
          booked,
          capacity: service.slotCapacity,
          available,
          isFull: available <= 0,
        };
      });
    }

    return sendSuccess(
      res,
      {
        service,
        availableSlots,
      },
      'Service retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new service (Admin only)
 * POST /api/services
 */
export const createService = async (req, res, next) => {
  try {
    const {
      name,
      code,
      description,
      category,
      counterName,
      estimatedDurationMin,
      slotCapacity,
      operatingHours,
      availableDays,
      assignedStaff,
    } = req.body;

    const existing = await Service.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return sendError(res, `A service with code "${code.toUpperCase()}" already exists.`, 409);
    }

    const service = await Service.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description.trim(),
      category: category || 'General',
      counterName: counterName || 'Counter 1',
      estimatedDurationMin: Number(estimatedDurationMin) || 15,
      slotCapacity: Number(slotCapacity) || 5,
      operatingHours: operatingHours || { start: '09:00', end: '17:00' },
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      assignedStaff: assignedStaff || [],
      isActive: true,
    });

    return sendSuccess(res, service, 'Service created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update service (Admin only)
 * PATCH /api/services/:id
 */
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.code) {
      updates.code = updates.code.toUpperCase().trim();
      const duplicate = await Service.findOne({ code: updates.code, _id: { $ne: id } });
      if (duplicate) {
        return sendError(res, `Another service is already using code "${updates.code}".`, 409);
      }
    }

    const service = await Service.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('assignedStaff', 'name email department');

    if (!service) {
      return sendError(res, 'Service not found', 404);
    }

    return sendSuccess(res, service, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate or delete service (Admin only)
 * DELETE /api/services/:id
 */
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return sendError(res, 'Service not found', 404);
    }

    // Check if there are active appointments for this service
    const activeAppointments = await Appointment.countDocuments({
      service: id,
      status: { $in: ['booked', 'waiting', 'serving'] },
    });

    if (activeAppointments > 0) {
      // Soft deactivate to avoid breaking existing queue
      service.isActive = false;
      await service.save();
      return sendSuccess(
        res,
        service,
        `Service has active appointments and was deactivated rather than permanently deleted.`
      );
    }

    // If no active appointments, safe to deactivate or remove
    service.isActive = false;
    await service.save();
    return sendSuccess(res, service, 'Service deactivated successfully');
  } catch (error) {
    next(error);
  }
};
