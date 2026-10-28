import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async toggleUserStatus(id) {
    const response = await api.patch(`/admin/users/${id}/status`);
    return response.data;
  },

  async getStaff() {
    const response = await api.get('/admin/staff');
    return response.data;
  },

  async createStaff(data) {
    const response = await api.post('/admin/staff', data);
    return response.data;
  },

  async getAnalytics() {
    const response = await api.get('/admin/analytics');
    return response.data;
  },
};
