import { sendError } from '../utils/responseHelper.js';

/**
 * 404 Not Found Handler for unmatched routes
 */
export const notFoundHandler = (req, res, next) => {
  return sendError(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Centralized error handling middleware
 * Safely handles Mongoose validation errors, cast errors, duplicate keys, and unexpected server exceptions.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for parameter: ${err.path}`;
  }

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field';
    const duplicatedValue = err.keyValue ? err.keyValue[duplicatedField] : '';
    message = `Duplicate value '${duplicatedValue}' for ${duplicatedField}. Must be unique.`;
  }

  // Log detailed stack trace in development, keep server logs clean in test
  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);
  }

  return sendError(res, message, statusCode, errors);
};
