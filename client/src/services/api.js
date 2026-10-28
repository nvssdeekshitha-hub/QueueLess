import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected network error occurred.';

    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
