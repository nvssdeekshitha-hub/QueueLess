import api from './api';

export const serviceService = {
  async getServices(params = {}) {
    const response = await api.get('/services', { params });
    return response.data;
  },

  async getServiceById(id, date = null) {
    const params = date ? { date } : {};
    const response = await api.get(`/services/${id}`, { params });
    return response.data;
  },

  async createService(data) {
    const response = await api.post('/services', data);
    return response.data;
  },

  async updateService(id, data) {
    const response = await api.patch(`/services/${id}`, data);
    return response.data;
  },

  async deleteService(id) {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};
