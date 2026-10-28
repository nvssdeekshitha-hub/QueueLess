import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import QueueAudit from '../models/QueueAudit.js';
import { generateBookingReference, formatTokenNumber } from '../utils/tokenGenerator.js';

/**
 * Valid state transitions for appointments in the queue
 */
const VALID_TRANSITIONS = {
  booked: ['waiting', 'serving', 'cancelled'],
  waiting: ['serving', 'skipped', 'cancelled'],
  serving: ['completed', 'skipped', 'cancelled'],
  skipped: ['waiting', 'serving', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Book an appointment with capacity validation and sequential token generation
 */
export const bookAppointmentService = async ({ userId, serviceId, appointmentDate, timeSlot, notes }) => {
  // 1. Verify service exists and is active
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }
  if (!service.isActive) {
    const error = new Error('This service is currently inactive and cannot accept bookings');
    error.statusCode = 400;
    throw error;
  }

  // 2. Concurrency check: Ensure slot capacity has not been exceeded
  const bookedCountInSlot = await Appointment.countDocuments({
    service: serviceId,
    appointmentDate,
    timeSlot,
    status: { $ne: 'cancelled' },
  });

  if (bookedCountInSlot >= service.slotCapacity) {
    const error = new Error(
      `Slot "${timeSlot}" is at full capacity (${service.slotCapacity} max). Please choose another time slot.`
    );
    error.statusCode = 409; // Conflict
    throw error;
  }

  // 3. Sequential token number for this service and date
  const lastAppointment = await Appointment.findOne({
    service: serviceId,
    appointmentDate,
  })
    .sort({ tokenSequence: -1 })
    .select('tokenSequence');

  const nextSequence = lastAppointment ? lastAppointment.tokenSequence + 1 : 1;
  const tokenNumber = formatTokenNumber(service.code, nextSequence);
  const bookingReference = generateBookingReference();

  // 4. Create appointment record
  const appointment = await Appointment.create({
    bookingReference,
    user: userId,
    service: serviceId,
    appointmentDate,
    timeSlot,
    tokenNumber,
    tokenSequence: nextSequence,
    status: 'booked',
    notes: notes || '',
    bookedAt: new Date(),
  });

  // 5. Create audit log
  await QueueAudit.create({
    appointment: appointment._id,
    service: serviceId,
    tokenNumber,
    action: 'BOOKED',
    newStatus: 'booked',
    performedBy: userId,
    notes: `Initial booking for slot ${timeSlot}`,
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('service', 'name code counterName estimatedDurationMin operatingHours')
    .populate('user', 'name email phone studentId');

  return populated;
};

/**
 * Get live queue status for a specific service and date
 */
export const getServiceQueueStatus = async (serviceId, queryDate) => {
  const dateStr = queryDate || new Date().toISOString().slice(0, 10);

  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  // Find currently serving token
  const currentlyServing = await Appointment.findOne({
    service: serviceId,
    appointmentDate: dateStr,
    status: 'serving',
  })
    .populate('user', 'name studentId')
    .sort({ servingStartedAt: -1 });

  // Find all active waiting appointments
  const waitingQueue = await Appointment.find({
    service: serviceId,
    appointmentDate: dateStr,
    status: { $in: ['booked', 'waiting'] },
  })
    .populate('user', 'name studentId')
    .sort({ tokenSequence: 1 });

  // Counts for summary metrics
  const [totalWaiting, totalCompleted, totalSkipped, totalCancelled] = await Promise.all([
    Appointment.countDocuments({ service: serviceId, appointmentDate: dateStr, status: { $in: ['booked', 'waiting'] } }),
    Appointment.countDocuments({ service: serviceId, appointmentDate: dateStr, status: 'completed' }),
    Appointment.countDocuments({ service: serviceId, appointmentDate: dateStr, status: 'skipped' }),
    Appointment.countDocuments({ service: serviceId, appointmentDate: dateStr, status: 'cancelled' }),
  ]);

  return {
    service: {
      id: service._id,
      name: service.name,
      code: service.code,
      counterName: service.counterName,
      estimatedDurationMin: service.estimatedDurationMin,
    },
    date: dateStr,
    currentlyServing: currentlyServing
      ? {
          id: currentlyServing._id,
          tokenNumber: currentlyServing.tokenNumber,
          bookingReference: currentlyServing.bookingReference,
          userName: currentlyServing.user?.name || 'Anonymous',
          timeSlot: currentlyServing.timeSlot,
          servingStartedAt: currentlyServing.servingStartedAt,
        }
      : null,
    totalWaiting,
    totalCompleted,
    totalSkipped,
    totalCancelled,
    waitingList: waitingQueue.map((apt, index) => ({
      id: apt._id,
      tokenNumber: apt.tokenNumber,
      tokenSequence: apt.tokenSequence,
      bookingReference: apt.bookingReference,
      userName: apt.user?.name || 'Student',
      timeSlot: apt.timeSlot,
      status: apt.status,
      positionAhead: index,
      estimatedWaitMin: Math.max(0, index * service.estimatedDurationMin),
    })),
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Get individual token status & wait time calculation
 */
export const getTokenStatusService = async (tokenIdOrRef) => {
  let appointment;

  if (tokenIdOrRef.startsWith('QL-')) {
    appointment = await Appointment.findOne({ bookingReference: tokenIdOrRef })
      .populate('service', 'name code counterName estimatedDurationMin operatingHours')
      .populate('user', 'name email phone studentId');
  } else {
    appointment = await Appointment.findById(tokenIdOrRef)
      .populate('service', 'name code counterName estimatedDurationMin operatingHours')
      .populate('user', 'name email phone studentId');
  }

  if (!appointment) {
    const error = new Error('Queue token or appointment not found');
    error.statusCode = 404;
    throw error;
  }

  // Calculate position ahead in queue
  let positionAhead = 0;
  let estimatedWaitMin = 0;

  if (['booked', 'waiting'].includes(appointment.status)) {
    positionAhead = await Appointment.countDocuments({
      service: appointment.service._id,
      appointmentDate: appointment.appointmentDate,
      status: { $in: ['booked', 'waiting'] },
      tokenSequence: { $lt: appointment.tokenSequence },
    });

    const isAnyoneServing = await Appointment.exists({
      service: appointment.service._id,
      appointmentDate: appointment.appointmentDate,
      status: 'serving',
    });

    const multiplier = positionAhead + (isAnyoneServing ? 1 : 0);
    estimatedWaitMin = multiplier * (appointment.service.estimatedDurationMin || 15);
  }

  // Fetch currently serving token for this service today
  const currentlyServing = await Appointment.findOne({
    service: appointment.service._id,
    appointmentDate: appointment.appointmentDate,
    status: 'serving',
  }).select('tokenNumber');

  return {
    appointment,
    positionAhead,
    estimatedWaitMin,
    currentlyServingToken: currentlyServing ? currentlyServing.tokenNumber : null,
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Call the next eligible token in queue
 */
export const callNextTokenService = async (serviceId, staffUserId) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Find next booked or waiting appointment
  const nextAppointment = await Appointment.findOne({
    service: serviceId,
    appointmentDate: todayStr,
    status: { $in: ['booked', 'waiting'] },
  }).sort({ tokenSequence: 1 });

  if (!nextAppointment) {
    return null; // Queue is empty
  }

  const prevStatus = nextAppointment.status;
  nextAppointment.status = 'waiting';
  nextAppointment.calledAt = new Date();
  nextAppointment.servedBy = staffUserId;
  await nextAppointment.save();

  // Audit trail
  await QueueAudit.create({
    appointment: nextAppointment._id,
    service: serviceId,
    tokenNumber: nextAppointment.tokenNumber,
    action: 'CALLED',
    previousStatus: prevStatus,
    newStatus: 'waiting',
    performedBy: staffUserId,
    notes: 'Token called by staff',
  });

  return Appointment.findById(nextAppointment._id)
    .populate('service', 'name code counterName estimatedDurationMin')
    .populate('user', 'name studentId phone');
};

/**
 * Update token status with state machine validation
 */
export const updateTokenStatusService = async (appointmentId, newStatus, staffUserId, reason = '') => {
  const appointment = await Appointment.findById(appointmentId).populate('service');
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = appointment.status;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    const error = new Error(
      `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed transitions: [${allowed.join(', ') || 'none'}]`
    );
    error.statusCode = 400;
    throw error;
  }

  // Update timestamps based on transition
  if (newStatus === 'serving') {
    appointment.servingStartedAt = new Date();
    appointment.servedBy = staffUserId;
  } else if (newStatus === 'completed') {
    appointment.completedAt = new Date();
    if (!appointment.servedBy) appointment.servedBy = staffUserId;
  } else if (newStatus === 'cancelled') {
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason || 'Cancelled by staff or user';
  }

  appointment.status = newStatus;
  await appointment.save();

  // Audit log
  await QueueAudit.create({
    appointment: appointment._id,
    service: appointment.service._id,
    tokenNumber: appointment.tokenNumber,
    action: newStatus.toUpperCase(),
    previousStatus: currentStatus,
    newStatus,
    performedBy: staffUserId,
    notes: reason || `Status changed to ${newStatus}`,
  });

  return appointment;
};
