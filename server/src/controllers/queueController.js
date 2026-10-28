import {
  getServiceQueueStatus,
  getTokenStatusService,
  callNextTokenService,
  updateTokenStatusService,
} from '../services/queueService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

/**
 * Get current live queue status for a service
 * GET /api/queue/:serviceId
 */
export const getQueue = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    const queueData = await getServiceQueueStatus(serviceId, date);
    return sendSuccess(res, queueData, 'Live queue status retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get tracking status for a specific token or booking reference
 * GET /api/queue/token/:tokenId
 */
export const getTokenStatus = async (req, res, next) => {
  try {
    const { tokenId } = req.params;

    const tokenData = await getTokenStatusService(tokenId);
    return sendSuccess(res, tokenData, 'Token status retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Call the next token in the queue for a service
 * POST /api/queue/:serviceId/next
 */
export const callNext = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    const nextAppointment = await callNextTokenService(serviceId, req.user._id);

    if (!nextAppointment) {
      return sendSuccess(res, null, 'No waiting appointments in queue for this service.');
    }

    return sendSuccess(res, nextAppointment, `Token ${nextAppointment.tokenNumber} called.`);
  } catch (error) {
    next(error);
  }
};

/**
 * Update token status (serving, completed, skipped, cancelled)
 * PATCH /api/queue/token/:tokenId/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const { status, reason } = req.body;

    const updated = await updateTokenStatusService(tokenId, status, req.user._id, reason);
    return sendSuccess(res, updated, `Token status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};
