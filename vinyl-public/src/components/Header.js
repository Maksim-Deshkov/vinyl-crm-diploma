import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ background: '#333', color: '#fff', padding: '1rem' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Link to="/" style={{ color: '#fff', marginRight: '1rem' }}>Головна</Link>
          <Link to="/catalog" style={{ color: '#fff', marginRight: '1rem' }}>Каталог</Link>
        </div>
        <div>
          <Link to="/cart" style={{ color: '#fff', marginRight: '1rem' }}>Кошик</Link>
          <Link to="/profile" style={{ color: '#fff' }}>Профіль</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
