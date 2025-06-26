import React, { useEffect, useState } from 'react';
import { getOrder, updateOrderStatus, addOrderComment, addOrderFile } from '../services/api';

const OrderDetails = ({ orderId, currentUser }) => {
  const [order, setOrder] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = () => {
    getOrder(orderId).then(res => setOrder(res.data));
  };

  const handleStatusChange = (newStatus) => {
    const newLog = [
      ...order.statusLog,
      { status: newStatus, date: new Date().toISOString(), by: currentUser }
    ];
    updateOrderStatus(order.id, newLog, newStatus)
      .then(loadOrder);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const updatedComments = [
      ...order.comments,
      { id: Date.now(), text: newComment, author: currentUser, date: new Date().toISOString() }
    ];
    addOrderComment(order.id, updatedComments)
      .then(() => {
        setNewComment('');
        loadOrder();
      });
  };

  const handleAddFile = () => {
    if (!fileUrl.trim()) return;
    const updatedFiles = [
      ...(order.files || []),
      { name: fileUrl.split('/').pop(), url: fileUrl }
    ];
    addOrderFile(order.id, updatedFiles)
      .then(() => {
        setFileUrl('');
        loadOrder();
      });
  };

  if (!order) return <p>Завантаження...</p>;

  return (
    <div>
      <h2>Деталі замовлення #{order.id}</h2>
      <p>Клієнт: {order.customerName}</p>
      <p>Статус: {order.status}</p>

      <h3>Історія статусів</h3>
      <ul>
        {order.statusLog.map((log, index) => (
          <li key={index}>
            {log.status} — {log.by} — {new Date(log.date).toLocaleString()}
          </li>
        ))}
      </ul>

      <button onClick={() => handleStatusChange('У процесі')}>У процесі</button>
      <button onClick={() => handleStatusChange('Відправлено')}>Відправлено</button>
      <button onClick={() => handleStatusChange('Закрито')}>Закрито</button>

      <h3>Коментарі</h3>
      <ul>
        {order.comments.map(c => (
          <li key={c.id}>
            {c.author} ({new Date(c.date).toLocaleString()}): {c.text}
          </li>
        ))}
      </ul>

      <textarea
        placeholder="Додати коментар"
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
      />
      <button onClick={handleAddComment}>Додати</button>

      <h3>Файли</h3>
      <ul>
        {(order.files || []).map((f, index) => (
          <li key={index}>
            <a href={f.url} target="_blank" rel="noopener noreferrer">{f.name}</a>
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Введіть URL файлу"
        value={fileUrl}
        onChange={e => setFileUrl(e.target.value)}
      />
      <button onClick={handleAddFile}>Додати файл</button>
    </div>
  );
};

export default OrderDetails;
