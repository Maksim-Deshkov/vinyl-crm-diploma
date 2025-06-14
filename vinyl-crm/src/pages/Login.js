import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    axios.get(`http://localhost:3001/users?email=${email}&password=${password}`)
      .then(res => {
        if (res.data.length > 0) {
          const user = res.data[0];
          onLogin(user);
        } else {
          alert('Невірний email або пароль');
        }
      })
      .catch(err => console.error('Помилка логіну:', err));
  };

  return (
    <div>
      <h2>Вхід до CRM</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br/>
      <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} /><br/>
      <button onClick={handleLogin}>Увійти</button>
    </div>
  );
};

export default Login;
