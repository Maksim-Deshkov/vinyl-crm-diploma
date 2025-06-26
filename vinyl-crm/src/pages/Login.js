import React, { useState } from 'react';
import api from '../services/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showRestore, setShowRestore] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setInfo('');

  if (!email.trim() || !password.trim()) {
    setError('Будь ласка, заповніть усі поля');
    return;
  }

  try {
    const res = await api.post('/users/crm-login', { email, password });
    const { user, token } = res.data;

    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      setError('Доступ дозволено лише адміністраторам та менеджерам');
      localStorage.removeItem('user'); // ⛔ важливо
      return;
    }

    const fullUser = { ...user, token };
    localStorage.setItem('user', JSON.stringify(fullUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    onLogin(fullUser);
  } catch (err) {
    if (err.response?.status === 401) {
      setError('Невірний email або пароль');
    } else if (err.response?.status === 403) {
      setError('Обліковий запис заморожено. Зверніться до адміністратора.');
    } else {
      setError('Сталася помилка. Спробуйте пізніше.');
    }
  }
};


  const handleRestorePassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!restoreEmail.trim()) {
      setError('Введіть email для відновлення');
      return;
    }

    // Демонстраційне відновлення паролю
    setTimeout(() => {
      setInfo('Інструкції для відновлення паролю надіслано на email (демо).');
    }, 1000);
  };

  return (
    <div className="login-container">
      <h2>Вхід до CRM</h2>
      {error && <div className="error">{error}</div>}
      {info && <div className="info">{info}</div>}

      {!showRestore ? (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Увійти</button>
          <button
            type="button"
            className="restore-btn"
            onClick={() => {
              setShowRestore(true);
              setError('');
              setInfo('');
            }}
          >
            Відновити пароль
          </button>
        </form>
      ) : (
        <form onSubmit={handleRestorePassword}>
          <input
            type="email"
            placeholder="Введіть ваш email"
            value={restoreEmail}
            onChange={(e) => setRestoreEmail(e.target.value)}
          />
          <button type="submit">Відновити</button>
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              setShowRestore(false);
              setError('');
              setInfo('');
            }}
          >
            Назад
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;
