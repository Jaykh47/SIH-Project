// API service — all backend calls go through here
// Uses Vite proxy so no hardcoded URLs are needed

import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const mockBase = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/mock` : '/mock';

const api = axios.create({
  baseURL: apiBase,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('landstack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;

    // 401 → session expired, force re-login
    if (status === 401) {
      localStorage.removeItem('landstack_token');
      localStorage.removeItem('landstack_user');
      localStorage.removeItem('landstack_demo_mode');
      window.location.href = '/login';
    }

    // 502/503/504 → Vite proxy couldn't reach backend (it's offline)
    // Don't redirect, just attach a friendly message and let the caller handle it
    if (!err.response || status === 502 || status === 503 || status === 504) {
      err.isBackendOffline = true;
      err.offlineMessage   = 'Backend is offline — running in demo mode.';
    }

    return Promise.reject(err);
  }
);

export default api;

// ── Auth ───────────────────────────────────────────────────────
export const authAPI = {
  login:    (email, password, extra = {}) => api.post('/auth/login', { email, password, ...extra }),
  register: (userData)                    => api.post('/auth/register', userData),
  sendOtp:  (email)                       => api.post('/auth/send-otp', { email }),
  verifyOtp:(email, otp)                  => api.post('/auth/verify-otp', { email, otp }),
  me:       ()                            => api.get('/auth/me'),
};

// ── Parcels & GIS Map ──────────────────────────────────────────
export const parcelsAPI = {
  getAll:    ()            => api.get('/parcels'),
  search:    (q)           => api.get('/parcels/search', { params: { q } }),
  getByUlpin:(ulpin)       => api.get(`/parcels/${ulpin}`),
  getUnified:(ulpin)       => api.get(`/parcels/${ulpin}/unified`),
  getNearby: (ulpin, r)    => api.get(`/parcels/${ulpin}/nearby`, { params: { radius: r } }),
};
export const mapAPI = parcelsAPI;

// ── Alerts ─────────────────────────────────────────────────────
export const alertsAPI = {
  summary:       ()           => api.get('/alerts/summary'),
  ai:            (status)     => api.get('/alerts/ai',      { params: { status } }),
  quality:       (status)     => api.get('/alerts/quality', { params: { status } }),
  verifyAi:      (id, action, remarks) => api.patch(`/alerts/ai/${id}/verify`, { action, remarks }),
  resolveQuality:(id, action, remarks) => api.patch(`/alerts/quality/${id}/resolve`, { action, remarks }),
};

// ── Applications ───────────────────────────────────────────────
export const applicationsAPI = {
  submit:    (data)        => api.post('/applications', data),
  my:        ()            => api.get('/applications/my'),
  getById:   (id)          => api.get(`/applications/${id}`),
  all:       (status)      => api.get('/applications', { params: { status } }),
  setStatus: (id, status, remarks) => api.patch(`/applications/${id}/status`, { status, remarks }),
};

// ── Dashboard ──────────────────────────────────────────────────
export const dashboardAPI = {
  stats:    () => api.get('/dashboard/stats'),
  activity: () => api.get('/dashboard/activity'),
};

// ── Mock Departments (for interoperability demo) ───────────────
export const mockAPI = {
  revenue:      (ulpin) => axios.get(`${mockBase}/revenue/${ulpin}`),
  registration: (ulpin) => axios.get(`${mockBase}/registration/${ulpin}`),
  tax:          (ulpin) => axios.get(`${mockBase}/tax/${ulpin}`),
  municipality: (ulpin) => axios.get(`${mockBase}/municipality/${ulpin}`),
  planning:     (ulpin) => axios.get(`${mockBase}/planning/${ulpin}`),
};
