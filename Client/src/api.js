import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL + '/api' });

// attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trendora_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

// get a readable error message from an axios error
export const getError = (err) => err.response?.data?.message || err.message || 'Something went wrong';

const placeholder =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" fill="#999" font-family="Arial" font-size="20" text-anchor="middle">No Image</text></svg>'
  );

// product images can be full urls or files uploaded to the server
export const imgUrl = (path) => {
  if (!path) return placeholder;
  return path.startsWith('http') ? path : API_URL + path;
};
export const onImgError = (e) => { e.target.onerror = null; e.target.src = placeholder; };

export default api;
