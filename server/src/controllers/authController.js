import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, studentId, department } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    // Role safety: Only 'student' can self-register unless created by admin
    const userRole = role === 'staff' || role === 'admin' ? 'student' : (role || 'student');

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      phone: phone || '',
      studentId: studentId || '',
      department: department || 'General',
    });

    // Session regeneration to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = user._id;
      req.session.role = user.role;

      return sendSuccess(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            studentId: user.studentId,
            department: user.department,
          },
        },
        'Registration successful',
        201
      );
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in existing user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Must explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'This account has been deactivated. Please contact an administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Regenerate session upon successful login
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = user._id;
      req.session.role = user.role;

      return sendSuccess(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            studentId: user.studentId,
            department: user.department,
          },
        },
        'Login successful'
      );
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user & invalidate session
 * POST /api/auth/logout
 */
export const logout = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return sendError(res, 'Could not log out. Please try again.', 500);
      }
      res.clearCookie('queueless.sid');
      return sendSuccess(res, null, 'Logged out successfully');
    });
  } else {
    return sendSuccess(res, null, 'Already logged out');
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getMe = (req, res) => {
  return sendSuccess(res, {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      studentId: req.user.studentId,
      department: req.user.department,
      createdAt: req.user.createdAt,
    },
  });
};

/**
 * Update authenticated user profile
 * PATCH /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, studentId, department } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (studentId !== undefined) user.studentId = studentId.trim();
    if (department !== undefined) user.department = department.trim();

    await user.save();

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          studentId: user.studentId,
          department: user.department,
        },
      },
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};
