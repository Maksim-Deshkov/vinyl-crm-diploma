import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/users/login', { email, password });
      console.log(res.data);

      let user = res.data.user || res.data;
      let token = res.data.token;

      if (user.isFrozen) {
        setError('Обліковий запис заморожено. Зверніться до адміністратора.');
        return;
      }

      if (!token && user.token) token = user.token;

      if (user && token) {
        const userData = { ...user, token };
        localStorage.setItem('user', JSON.stringify(userData));
        if (typeof onLogin === 'function') onLogin(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        navigate('/profile');
      } else {
        setError('Некоректна відповідь сервера');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Невірний email або пароль');
      } else if (err.response?.status === 403) {
        setError('Обліковий запис заморожено. Зверніться до адміністратора.');
      } else {
        setError(err.response?.data?.message || 'Помилка входу');
      }
    }
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Вхід</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">Увійти</button>
        </form>
        <button type="button" className="register-btn" onClick={handleRegister}>
          Зареєструватися
        </button>
        <button type="button" className="reset-btn" onClick={handleResetPassword}>
          Забули пароль?
        </button>
      </div>
    </div>
  );
};

export default Login;
