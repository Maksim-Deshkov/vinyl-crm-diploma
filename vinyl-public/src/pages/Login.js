import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    if (!email) {
      alert('Введіть email');
      return;
    }
    onLogin(email);
  };

  return (
    <div>
      <h2>Вхід</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={handleLogin}>Увійти</button>
    </div>
  );
};

export default Login;
