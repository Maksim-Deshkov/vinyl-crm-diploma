import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartProvider from "./context/CartContext";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import VinylDetails from "./pages/VinylDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import api from "./services/api";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    } else {
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    window.location.reload();
  };

  return (
    <CartProvider>
      <Router>
        <Header user={user} logout={handleLogout} />

        <main className="main-content">
          <Routes>
            {/* Доступно лише якщо не залогінені */}
            <Route
              path="/login"
              element={
                user
                  ? <Navigate to="/profile" replace />
                  : <Login onLogin={handleLogin} />
              }
            />
            <Route
              path="/register"
              element={
                user
                  ? <Navigate to="/profile" replace />
                  : <Register />
              }
            />

            {/* Публічні сторінки */}
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/vinyl/:id" element={<VinylDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Профіль — тільки для залогінених */}
            <Route
              path="/profile"
              element={
                user
                  ? <Profile user={user} />
                  : <Navigate to="/login" replace />
              }
            />

            {/* Все інше — на головну */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </Router>
    </CartProvider>
  );
};

export default App;
