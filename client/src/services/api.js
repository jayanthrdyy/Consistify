import axios from 'axios';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api' 
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('consistify_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('consistify_token');
      localStorage.removeItem('consistify_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const taskService = {
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  reorder: (tasks) => api.put('/tasks/reorder', { tasks }),
};

export const analyticsService = {
  get: () => api.get('/analytics'),
  getStreaks: () => api.get('/analytics/streaks'),
};

export default api;
