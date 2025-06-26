import axios from 'axios';

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const { token } = JSON.parse(user);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      localStorage.removeItem('user');
    }
  }
  return config;
}, error => Promise.reject(error));

export default api;
