import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaUser, FaSignOutAlt, FaStore } from 'react-icons/fa';

const Header = ({ user, logout }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">Vinyl Market</Link>
        </div>
        <nav className="nav-desktop">
          <Link to="/"> <FaHome /> Головна</Link>
          <Link to="/catalog"> <FaStore /> Магазин</Link>
          <Link to="/cart"> <FaShoppingCart /> Корзина</Link>
          {user ? (
            <>
              <Link to="/profile"> <FaUser /> {user.name || 'Профіль'}</Link>
              <button className="btn" onClick={logout}> <FaSignOutAlt /> Вихід</button>
            </>
          ) : (
            <Link className="btn" to="/login"> <FaUser /> Вхід</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
