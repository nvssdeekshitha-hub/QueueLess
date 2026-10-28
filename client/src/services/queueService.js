import api from './api';

export const queueService = {
  async getQueue(serviceId, date = null) {
    const params = date ? { date } : {};
    const response = await api.get(`/queue/${serviceId}`, { params });
    return response.data;
  },

  async getTokenStatus(tokenId) {
    const response = await api.get(`/queue/token/${tokenId}`);
    return response.data;
  },

  async callNext(serviceId) {
    const response = await api.post(`/queue/${serviceId}/next`);
    return response.data;
  },

  async updateStatus(tokenId, status, reason = '') {
    const response = await api.patch(`/queue/token/${tokenId}/status`, { status, reason });
    return response.data;
  },
};
