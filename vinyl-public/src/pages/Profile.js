import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Profile = ({ user: propUser, onUpdateUser }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!propUser) {
      setUser(null);
      setOrders([]);
      setForm({
        name: '',
        email: '',
        address: '',
        phone: ''
      });
      return;
    }

    setUser(propUser);
    setForm({
      name: propUser.name || '',
      email: propUser.email || '',
      address: propUser.address || '',
      phone: propUser.phone || ''
    });
  }, [propUser]);

  useEffect(() => {
    if (!user || !user._id) {
      setOrders([]);
      return;
    }

    setOrdersLoading(true);

    // Безпечне завантаження замовлень лише для свого userId
    api.get(`/orders/with-vinyls?userId=${user._id}`)
      .then(res => {
        // Фільтрація на всяк випадок і на клієнті (додатково)
        const filtered = res.data.filter(order => order.userId === user._id);
        setOrders(filtered);
      })
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user?._id]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!user) return;
    try {
      const res = await api.patch('/users/me', { ...form, _id: user._id });
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdateUser) onUpdateUser(updatedUser);
      setEditing(false);
    } catch (err) {
      alert('Не вдалося оновити профіль');
      if (err.response) {
        alert(`Помилка: ${err.response.status} - ${err.response.data.message || ''}`);
        console.error(err.response.data);
      } else {
        console.error(err);
      }
    }
  };

  if (!user) {
    return (
      <div className="profile-page-grid">
        <div className="profile-card">
          <h2>Профіль</h2>
          <p>Будь ласка, увійдіть, щоб переглянути профіль.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-grid">
      <div className="profile-card">
        <h2>Профіль</h2>
        <div className="profile-form">
          <label htmlFor="name">Імʼя</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={!editing}
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            disabled
          />

          <label htmlFor="address">Адреса</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            disabled={!editing}
          />

          <label htmlFor="phone">Телефон</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={!editing}
          />

          <div className="profile-actions" style={{ marginTop: 16 }}>
            {!editing ? (
              <button type="button" onClick={() => setEditing(true)}>
                Редагувати
              </button>
            ) : (
              <>
                <button type="button" onClick={handleSave}>
                  Зберегти
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      name: user.name || '',
                      email: user.email || '',
                      address: user.address || '',
                      phone: user.phone || ''
                    });
                  }}
                >
                  Скасувати
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-orders">
        <h2>Мої замовлення</h2>
        {ordersLoading ? (
          <div className="orders-loading">Завантаження…</div>
        ) : !orders.length ? (
          <div className="orders-empty">Замовлень не знайдено.</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Платівки</th>
                <th>Сума</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</td>
                  <td>{order.status}</td>
                  <td>
                    <ul>
                      {(order.vinylInfos || []).map((v, i) => (
                        <li key={i}>
                          {v.title} — {v.artist} (x{v.count})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    {order.payment?.amount
                      ? `${order.payment.amount} грн`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Profile;
