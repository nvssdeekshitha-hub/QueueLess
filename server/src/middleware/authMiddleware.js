import User from '../models/User.js';
import { sendError } from '../utils/responseHelper.js';

/**
 * Middleware: Verify that user is authenticated via session
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return sendError(res, 'Authentication required. Please log in.', 401);
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      // Session exists but user was deleted
      req.session.destroy();
      return sendError(res, 'User account not found. Please log in again.', 401);
    }

    if (!user.isActive) {
      req.session.destroy();
      return sendError(res, 'Account has been deactivated. Please contact an administrator.', 403);
    }

    // Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return sendError(res, 'Authentication check failed.', 500);
  }
};

/**
 * Middleware: Authorize specific user roles (RBAC)
 * e.g., authorizeRoles('admin', 'staff')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${roles.join(', ')}].`,
        403
      );
    }

    next();
  };
};
