import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL + '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trendora_admin_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('trendora_admin_token');
      localStorage.removeItem('trendora_admin_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getError = (err) => err.response?.data?.message || err.message || 'Something went wrong';

export const imgUrl = (path) => {
  if (!path) return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="100%" height="100%" fill="#eee"/></svg>');
  return path.startsWith('http') ? path : API_URL + path;
};

export default api;
