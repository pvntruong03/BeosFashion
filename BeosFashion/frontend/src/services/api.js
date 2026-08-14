import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT and guest sessionId
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('uq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let sessionId = localStorage.getItem('uq_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('uq_session_id', sessionId);
    }
    config.headers['X-Session-Id'] = sessionId;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified response unwrapping & handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (localStorage.getItem('uq_token')) {
        localStorage.removeItem('uq_token');
        localStorage.removeItem('uq_user');
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
