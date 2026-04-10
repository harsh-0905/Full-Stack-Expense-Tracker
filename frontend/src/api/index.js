import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach token ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('et_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network error';
    const status  = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('et_token');
      localStorage.removeItem('et_user');
      window.location.href = '/login';
    }

    const err = new Error(message);
    err.status = status;
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)         => api.post('/auth/register', data),
  login:    (data)         => api.post('/auth/login', data),
  getMe:    ()             => api.get('/auth/me'),
  updateProfile: (data)    => api.patch('/auth/profile', data),
};

// ── Expenses ─────────────────────────────────────────────────────────────────
export const expensesAPI = {
  getAll:      (params)         => api.get('/expenses', { params }),
  getOne:      (id)             => api.get(`/expenses/${id}`),
  create:      (data)           => api.post('/expenses', data),
  update:      (id, data)       => api.put(`/expenses/${id}`, data),
  remove:      (id)             => api.delete(`/expenses/${id}`),
  bulkDelete:  (ids)            => api.post('/expenses/bulk-delete', { ids }),
  getCategories: ()             => api.get('/expenses/categories'),
};

// ── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard:       (period) => api.get('/analytics/dashboard', { params: { period } }),
  getSummary:         (period) => api.get('/analytics/summary', { params: { period } }),
  getCategories:      (period) => api.get('/analytics/categories', { params: { period } }),
  getTrend:           (period) => api.get('/analytics/trend', { params: { period } }),
  getComparison:      ()       => api.get('/analytics/comparison'),
  getTopExpenses:     (limit)  => api.get('/analytics/top', { params: { limit } }),
  getPaymentMethods:  (period) => api.get('/analytics/payment-methods', { params: { period } }),
};

export default api;
