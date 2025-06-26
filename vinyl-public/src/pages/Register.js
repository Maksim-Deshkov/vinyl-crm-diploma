import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const { name, email, password } = form;
    if (!name || !email || !password) {
      setError('Заповніть всі обовʼязкові поля');
      return;
    }

    try {
      const res = await api.post('/users/register', form);
      console.log(res.data);
      alert('Реєстрація успішна! Виконайте вхід.');
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Користувач вже існує');
      } else {
        setError('Помилка реєстрації');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Реєстрація</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ім'я*"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email*"
            autoComplete="username"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Пароль*"
            autoComplete="new-password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <input
            type="text"
            placeholder="Телефон"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Адреса"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
          />
          <button type="submit">Зареєструватися</button>
        </form>
        <button
          type="button"
          className="reset-btn"
          onClick={() => navigate('/login')}
        >
          Вже є акаунт? Увійти
        </button>
      </div>
    </div>
  );
};

export default Register;
