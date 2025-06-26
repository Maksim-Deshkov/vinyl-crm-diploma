import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Checkout = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [vinylMap, setVinylMap] = useState({});
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    paymentMethod: 'cash'
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser._id) {
      setUser(storedUser);
      api.get(`/users/${storedUser._id}`).then(async res => {
        const u = res.data;
        setUser(u);
        setForm(prev => ({
          ...prev,
          name: u.name || '',
          phone: u.phone || '',
          email: u.email || ''
        }));
        const cart = u.cart || [];
        setCartItems(cart);
        await loadVinylDetails(cart);
      });
    } else {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(localCart);
      loadVinylDetails(localCart);
    }
  }, []);

  const extractId = (item) => {
    if (item._id && typeof item._id === 'object' && item._id._id) {
      return item._id._id.toString();
    }
    if (item._id) {
      return item._id.toString();
    }
    if (item.productId) {
      return item.productId.toString();
    }
    return null;
  };

  const loadVinylDetails = async (cart) => {
    const ids = Array.from(new Set(cart.map(extractId).filter(Boolean)));
    if (!ids.length) return;

    try {
      const res = await api.post('/vinyls/by-ids', { ids });
      const map = {};
      res.data.forEach(v => {
        map[v._id?.toString()] = v;
        map[v.id] = v;
      });
      setVinylMap(map);
    } catch (err) {
      console.error('Помилка завантаження деталей платівок', err);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getQuantity = (item) => item.quantity || item.count || 1;

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const id = extractId(item);
      const vinyl = vinylMap[id];
      const quantity = getQuantity(item);
      const price = vinyl?.price || 0;
      return sum + price * quantity;
    }, 0);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const total = calculateTotal();

    try {
      await api.post('/orders', {
        vinylID: cartItems.map(i => ({
          id: extractId(i),
          count: getQuantity(i)
        })),
        userId: user?._id || 'анонім',
        client: {
          name: form.name,
          phone: form.phone,
          email: form.email
        },
        shipment: {
          address: form.address
        },
        payment: {
          method: form.paymentMethod,
          amount: total
        }
      });

      alert('Замовлення оформлено!');
      localStorage.removeItem('cart');
      setCartItems([]);
    } catch (err) {
      console.error('Помилка при оформленні замовлення', err);
      if (err.response) {
        alert(`Не вдалося оформити замовлення: ${err.response.data.message || 'Невідома помилка'}`);
      } else {
        alert('Не вдалося оформити замовлення: немає відповіді від сервера');
      }
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-cart">
        <h3>Ваші платівки</h3>
        {cartItems.length === 0 ? (
          <p>Корзина порожня</p>
        ) : (
          <ul>
            {cartItems.map((item, idx) => {
              const id = extractId(item);
              const v = vinylMap[id] || {};
              const imgSrc = v.cover
                ? `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/uploads/${v.cover}`
                : '/default-cover.png';
              return (
                <li key={id + '-' + idx} className="checkout-item">
                  <img src={imgSrc} alt={v.title || 'Платівка'} style={{ width: 40, height: 40, objectFit: 'cover' }} />
                  <div>
                    <div><strong>{v.title || 'Платівка'}</strong></div>
                    <div>{v.artist || ''}</div>
                    <div>{getQuantity(item)} шт.</div>
                    <div>{v.price ? `${v.price} грн` : '—'}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {cartItems.length > 0 && (
          <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
            Загальна сума: {calculateTotal()} грн
          </div>
        )}
      </div>

      <div className="checkout-details">
        <h3>Деталі замовлення</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Ім'я:
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Телефон:
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>
          <label>
            Email:
            <input name="email" value={form.email} onChange={handleChange} required type="email" />
          </label>
          <label>
            Адреса:
            <input name="address" value={form.address} onChange={handleChange} required />
          </label>
          <label>
            Метод оплати:
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
              <option value="cash">При отриманні</option>
              <option value="bank">По реквізитам</option>
            </select>
          </label>
          <button type="submit">Оформити замовлення</button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
