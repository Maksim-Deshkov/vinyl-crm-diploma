import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import api from '../services/api';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, loadCartFromServer } = useContext(CartContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const API_ROOT = api.defaults.baseURL.replace(/\/api\/?$/, '');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      loadCartFromServer(u._id); // Завантаження кошика з БД
    }
  }, [loadCartFromServer]);

  const total = cartItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

  return (
    <div className="cart-page">
      <h2>Ваш кошик</h2>
      {cartItems.length > 0 ? (
        <>
          <div className="cart-list">
            {cartItems.map(item => (
              <div key={item._id} className="cart-item">
                <div className="cart-img">
                  <img
                    src={item.cover ? `${API_ROOT}/uploads/${item.cover}` : '/default-cover.png'}
                    alt={item.title}
                    style={{ maxWidth: '100px' }}
                  />
                </div>
                <div className="cart-main">
                  <span className="cart-title">
                    {item.title} <span className="artist">{item.artist}</span>
                  </span>
                  <span className="cart-price">{item.price} грн</span>
                  <div className="cart-controls">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateQuantity(item._id, +e.target.value)}
                    />
                    <button onClick={() => removeFromCart(item._id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div>
              <span>Загалом:</span>
              <strong>{total} грн</strong>
            </div>
            <div className="cart-actions">
              <button onClick={() => navigate('/checkout')} className="checkout-btn">
                Оформити замовлення
              </button>
              <button onClick={clearCart} className="clear-btn">
                Очистити кошик
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="empty">Кошик порожній</p>
      )}
    </div>
  );
};

export default CartPage;
