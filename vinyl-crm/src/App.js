import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Vinyls from './pages/Vinyls';
import Users from './pages/Users';
import AdminPanel from './pages/AdminPanel';
import ModerateReviews from './pages/ModerateReviews';
import Login from './pages/Login';

// ⛔ нова сторінка для користувачів без доступу
const Unauthorized = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>⛔ Доступ заборонено</h2>
    <p>Тільки адміністратори та менеджери можуть користуватися CRM.</p>
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Stored user:', storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Parsed user role:', parsedUser.role);
      if (parsedUser.role === 'admin' || parsedUser.role === 'manager') {
        setUser(parsedUser);
      } else {
        console.warn('Недостатні права доступу. Користувач викинутий');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    if (userData.role === 'admin' || userData.role === 'manager') {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
      alert('Доступ дозволено лише адміністраторам та менеджерам');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const userRole = user?.role || null;

  return (
    <Router>
      {user ? (
        <>
          <header className="app-header">
            <nav className="app-nav">
              <Link to="/">Дашборд</Link>
              <Link to="/orders">Замовлення</Link>
              <Link to="/vinyls">Платівки</Link>
              <Link to="/users">Користувачі</Link>
              {(userRole === 'admin' || userRole === 'manager') && (
                <Link to="/moderate">Коментарі</Link>
              )}
              {userRole === 'admin' && <Link to="/admin">Адмін панель</Link>}
              <button onClick={handleLogout} className="logout-button">Вийти</button>
            </nav>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/vinyls" element={<Vinyls />} />
              <Route path="/users" element={<Users />} />
              <Route path="/moderate" element={
                (userRole === 'admin' || userRole === 'manager') ? <ModerateReviews /> : <Navigate to="/unauthorized" />
              } />
              <Route path="/admin" element={
                userRole === 'admin' ? <AdminPanel /> : <Navigate to="/unauthorized" />
              } />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;
