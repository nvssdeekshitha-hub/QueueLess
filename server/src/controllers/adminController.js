import User from '../models/User.js';
import Service from '../models/Service.js';
import Appointment from '../models/Appointment.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/responseHelper.js';

/**
 * Get high-level admin dashboard summary counters
 * GET /api/admin/dashboard
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);

    const [
      totalUsers,
      totalServices,
      totalStaff,
      todayAppointments,
      todayWaiting,
      todayServing,
      todayCompleted,
      todayCancelled,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Service.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'staff' }),
      Appointment.countDocuments({ appointmentDate: todayStr }),
      Appointment.countDocuments({ appointmentDate: todayStr, status: { $in: ['booked', 'waiting'] } }),
      Appointment.countDocuments({ appointmentDate: todayStr, status: 'serving' }),
      Appointment.countDocuments({ appointmentDate: todayStr, status: 'completed' }),
      Appointment.countDocuments({ appointmentDate: todayStr, status: 'cancelled' }),
    ]);

    // Average service wait time calculation using MongoDB Aggregation
    const waitTimeAggregate = await Appointment.aggregate([
      {
        $match: {
          status: 'completed',
          servingStartedAt: { $exists: true, $ne: null },
          bookedAt: { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          waitDurationMinutes: {
            $divide: [{ $subtract: ['$servingStartedAt', '$bookedAt'] }, 1000 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgWaitTime: { $avg: '$waitDurationMinutes' },
        },
      },
    ]);

    const avgWaitMinutes = waitTimeAggregate.length > 0 ? Math.round(waitTimeAggregate[0].avgWaitTime) : 12;

    return sendSuccess(
      res,
      {
        overview: {
          totalUsers,
          totalServices,
          totalStaff,
          todayAppointments,
          todayWaiting,
          todayServing,
          todayCompleted,
          todayCancelled,
          avgWaitMinutes,
        },
      },
      'Dashboard stats retrieved'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get registered users with filtering and pagination
 * GET /api/admin/users
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    return sendPaginated(res, users, total, pageNum, limitNum, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all staff members
 * GET /api/admin/staff
 */
export const getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password').sort({ name: 1 });
    return sendSuccess(res, staff, 'Staff members retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new staff account
 * POST /api/admin/staff
 */
export const createStaff = async (req, res, next) => {
  try {
    const { name, email, password, department, phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendError(res, 'User with this email already exists', 409);
    }

    const staff = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'staff',
      department: department || 'General Administration',
      phone: phone || '',
    });

    return sendSuccess(
      res,
      {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        department: staff.department,
      },
      'Staff account created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user active status
 * PATCH /api/admin/users/:id/status
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.role === 'admin' && user._id.equals(req.user._id)) {
      return sendError(res, 'Administrators cannot deactivate their own account', 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    return sendSuccess(
      res,
      { id: user._id, name: user.name, isActive: user.isActive },
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Advanced analytics powered by MongoDB Aggregation Pipeline
 * Demonstrates: $match, $group, $sort, $project, $lookup
 * GET /api/admin/analytics
 */
export const getAnalytics = async (req, res, next) => {
  try {
    // 1. Daily Bookings Trend (Last 7 Days)
    const dailyTrend = await Appointment.aggregate([
      {
        $group: {
          _id: '$appointmentDate',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
      {
        $project: {
          date: '$_id',
          total: 1,
          completed: 1,
          cancelled: 1,
          _id: 0,
        },
      },
    ]);

    // 2. Status Breakdown
    const statusBreakdown = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 3. Peak Hours Breakdown (Grouping by timeSlot)
    const peakHours = await Appointment.aggregate([
      {
        $group: {
          _id: '$timeSlot',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $project: {
          slot: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 4. Bookings & Completion per Service
    const serviceDistribution = await Appointment.aggregate([
      {
        $group: {
          _id: '$service',
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceDetails',
        },
      },
      { $unwind: '$serviceDetails' },
      {
        $project: {
          name: '$serviceDetails.name',
          code: '$serviceDetails.code',
          totalBookings: 1,
          completedBookings: 1,
          _id: 0,
        },
      },
      { $sort: { totalBookings: -1 } },
    ]);

    return sendSuccess(
      res,
      {
        dailyTrend,
        statusBreakdown,
        peakHours,
        serviceDistribution,
      },
      'Analytics generated successfully'
    );
  } catch (error) {
    next(error);
  }
};
