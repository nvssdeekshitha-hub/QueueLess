import api from './api';

export const appointmentService = {
  async getAppointments(params = {}) {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  async getAppointmentById(id) {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  async bookAppointment(data) {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  async cancelAppointment(id, reason = '') {
    const response = await api.patch(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  async deleteAppointment(id) {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};
