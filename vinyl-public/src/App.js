import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Catalog from './pages/Catalog.js';
import Cart from './pages/Cart.js';
import Login from './pages/Login.js';

const App = () => (
  <CartProvider>
    <Router>
      <nav>
        <Link to="/">Каталог</Link> | <Link to="/cart">Кошик</Link> | <Link to="/login">Вхід</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  </CartProvider>
);

export default App;
