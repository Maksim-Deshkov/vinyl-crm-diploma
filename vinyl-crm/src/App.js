import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Vinyls from './pages/Vinyls';
import Users from './pages/Users';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      {user ? (
        <>
          <header style={{ background: '#333', color: '#fff', padding: '1rem' }}>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/" style={{ color: '#fff' }}>Дашборд</Link>
              <Link to="/orders" style={{ color: '#fff' }}>Замовлення</Link>
              <Link to="/vinyls" style={{ color: '#fff' }}>Платівки</Link>
              <Link to="/users" style={{ color: '#fff' }}>Користувачі</Link>
              {user.role === 'admin' && <Link to="/admin" style={{ color: '#fff' }}>Адмін панель</Link>}
              <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'red', color: '#fff' }}>Вийти</button>
            </nav>
          </header>
          <main style={{ padding: '1rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/vinyls" element={<Vinyls />} />
              <Route path="/users" element={<Users />} />
              <Route path="/admin" element={user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="*" element={<Login onLogin={setUser} />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;
