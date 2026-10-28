import { useState, useEffect, useCallback, useRef } from 'react';
import { queueService } from '../services/queueService';

/**
 * Custom hook for live queue tracking with auto-polling
 * @param {string} serviceId - The ID of the service to poll
 * @param {number} pollIntervalMs - Polling interval in ms (default: 5000ms = 5s)
 */
export const useQueue = (serviceId, pollIntervalMs = 5000) => {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const timerRef = useRef(null);

  const fetchQueue = useCallback(async () => {
    if (!serviceId) return;

    try {
      const res = await queueService.getQueue(serviceId);
      if (res.success) {
        setQueueData(res.data);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchQueue();

    if (isPolling && serviceId) {
      timerRef.current = setInterval(() => {
        fetchQueue();
      }, pollIntervalMs);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [serviceId, pollIntervalMs, isPolling, fetchQueue]);

  return {
    queueData,
    loading,
    error,
    refresh: fetchQueue,
    isPolling,
    setIsPolling,
  };
};
