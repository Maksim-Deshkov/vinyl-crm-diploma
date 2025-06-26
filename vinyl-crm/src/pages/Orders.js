import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: 'All', search: '' });
  const fixedStatusOptions = ['НОВЕ', 'В ОБРОБЦІ', 'ВІДПРАВЛЕНО', 'ВИКОНАНО', 'ВІДХИЛЕНО'];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    api.get('/orders/with-vinyls')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Помилка завантаження замовлень:', err));
  };

  const updateStatus = (id, status, byRole = 'manager') => {
    api.patch(`/orders/${id}`, { status, byRole })
      .then(() => loadOrders())
      .catch(err => console.error('Помилка оновлення статусу:', err));
  };

  const reopenOrder = (id) => {
    api.patch(`/orders/${id}/reopen`, { byRole: 'admin' })
      .then(() => loadOrders())
      .catch(err => console.error('Помилка відкриття замовлення:', err));
  };

  const statusOptions = useMemo(() => ['All', ...fixedStatusOptions], []);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return orders.filter(o => {
      if (filters.status !== 'All' && o.status !== filters.status) return false;
      if (term) {
        const { name = '', phone = '', email = '' } = o.userInfo || {};
        const hay = [o._id, name, phone, email].join(' ').toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [orders, filters]);

  return (
    <div className="orders-page">
      <h2>Список замовлень</h2>

      <div className="orders-filters">
        <div className="filter">
          <label>Статус:</label>
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            {statusOptions.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'Всі' : s}</option>
            ))}
          </select>
        </div>

        <div className="filter">
          <label>Пошук:</label>
          <input
            type="text"
            placeholder="ID / ПІБ / Телефон / Email"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Платівки</th>
            <th>Статус</th>
            <th>Контакти замовника</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(o => {
            const {
              _id,
              vinylInfos = [],
              status,
              isClosed,
              address = '—',
              userInfo = {}
            } = o;

            const {
              name = '—',
              phone = '—',
              email = '—'
            } = userInfo;

            let rowStyle = {};
            if (status === 'ВИКОНАНО') {
              rowStyle = { background: '#d4edda' };
            } else if (status === 'ВІДХИЛЕНО') {
              rowStyle = { background: '#f8d7da' };
            }

            return (
              <tr key={_id} style={rowStyle}>
                <td>{_id}</td>
                <td>
                  {vinylInfos.length
                    ? vinylInfos.map(v => `${v.title} — ${v.artist} (${v.count} шт.)`).join(', ')
                    : 'Невідомо'}
                </td>
                <td>
                  <select
                    value={status}
                    disabled={isClosed}
                    onChange={e => updateStatus(_id, e.target.value)}
                  >
                    {fixedStatusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {isClosed && (
                    <div style={{ color: 'red', fontSize: '0.8em' }}>
                      Замовлення закрите
                    </div>
                  )}
                </td>
                <td>
                  <strong>ПІБ:</strong> {name}<br />
                  <strong>Телефон:</strong> {phone}<br />
                  <strong>Email:</strong> {email}<br />
                  <strong>Адреса:</strong> {address}
                </td>
                <td>
                  {isClosed && (
                    <button onClick={() => reopenOrder(_id)}>Відкрити (адмін)</button>
                  )}
                </td>
              </tr>
            );
          })}
          {!filtered.length && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>
                Нічого не знайдено
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
