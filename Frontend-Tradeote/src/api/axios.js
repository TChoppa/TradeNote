import axios from 'axios';

// All requests go through Vite proxy
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ───────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tradenote_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if NOT on login/forgot-password page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/forgot-password')) {
        localStorage.removeItem('tradenote_token');
        localStorage.removeItem('tradenote_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;