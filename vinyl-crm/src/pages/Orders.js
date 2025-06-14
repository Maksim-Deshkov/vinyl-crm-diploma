import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    axios.get('http://localhost:3001/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Помилка завантаження замовлень:', err));
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await axios.patch(`http://localhost:3001/orders/${id}`, {
        status: newStatus
      });
      console.log('Відповідь від сервера:', response.data);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Помилка зміни статусу:', error.response ? error.response.data : error);
      alert('Не вдалося змінити статус замовлення.');
    }
  };

  const addComment = async (orderId, commentText) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const newComment = {
        id: Date.now(),
        text: commentText,
        author: 'менеджер1'
      };
      const updatedComments = [...(order.comments || []), newComment];

      await axios.patch(`http://localhost:3001/orders/${orderId}`, {
        comments: updatedComments
      });

      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === orderId ? { ...o, comments: updatedComments } : o
        )
      );
    } catch (err) {
      console.error('Помилка додавання коментаря:', err);
      alert('Не вдалося додати коментар');
    }
  };

  const updateNote = async (id, newNote) => {
    try {
      await axios.patch(`http://localhost:3001/orders/${id}`, { note: newNote });
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === id ? { ...o, note: newNote } : o
        )
      );
    } catch (err) {
      console.error('Помилка оновлення нотатки:', err);
    }
  };

  // Фільтрація
  let filteredOrders = filter
    ? orders.filter(o => o.status === filter)
    : orders;

  // Сортування
  if (sort === 'asc') {
    filteredOrders = [...filteredOrders].sort((a, b) => a.total - b.total);
  } else if (sort === 'desc') {
    filteredOrders = [...filteredOrders].sort((a, b) => b.total - a.total);
  }

  return (
    <div>
      <h2>Список замовлень</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Фільтр за статусом: </label>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Всі</option>
          <option value="Нове">Нове</option>
          <option value="У процесі">У процесі</option>
          <option value="Відправлено">Відправлено</option>
          <option value="Закрито">Закрито</option>
        </select>

        <label style={{ marginLeft: '1rem' }}>Сортувати за сумою: </label>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">---</option>
          <option value="asc">Зростання</option>
          <option value="desc">Спадання</option>
        </select>
      </div>

      {filteredOrders.length > 0 ? (
        <table border="1" cellPadding="5" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ім'я клієнта</th>
              <th>Сума</th>
              <th>Статус</th>
              <th>Змінити статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <React.Fragment key={o.id}>
                <tr>
                  <td>{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{o.total} грн</td>
                  <td>{o.status}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                    >
                      <option value="Нове">Нове</option>
                      <option value="У процесі">У процесі</option>
                      <option value="Відправлено">Відправлено</option>
                      <option value="Закрито">Закрито</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td colSpan="5">
                    <div>
                      <strong>Нотатка:</strong>
                      <input
                        type="text"
                        defaultValue={o.note || ''}
                        placeholder="Нотатка менеджера"
                        onBlur={e => updateNote(o.id, e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <strong>Коментарі:</strong>
                      <ul>
                        {(o.comments || []).map(c => (
                          <li key={c.id}><strong>{c.author}:</strong> {c.text}</li>
                        ))}
                      </ul>
                      <input
                        type="text"
                        placeholder="Додати коментар і натиснути Enter"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            addComment(o.id, e.target.value.trim());
                            e.target.value = '';
                          }
                        }}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Немає замовлень за обраним фільтром.</p>
      )}
    </div>
  );
};

export default Orders;
