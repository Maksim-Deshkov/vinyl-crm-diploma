import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
  }
  return config;
}, error => Promise.reject(error));

export default api;
