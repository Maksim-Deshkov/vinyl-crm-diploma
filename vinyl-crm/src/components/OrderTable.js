import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import NoteForm from '../components/NoteForm';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(res => setOrder(res.data));
  }, [id]);

  const addComment = text => {
    const newComment = { author: 'менеджер', text, date: Date.now() };
    api.post(`/orders/${id}/comments`, newComment).then(() =>
      setOrder(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }))
    );
  };

  if (!order) return <p>Завантаження...</p>;

  return (
    <div className="container">
      <h2 className="mb-3">Замовлення #{order.id}</h2>
      <ul className="list-group mb-4">
        <li className="list-group-item">Клієнт: {order.customerName}</li>
        <li className="list-group-item">Сума: {order.total} грн</li>
        <li className="list-group-item">Статус: {order.status}</li>
      </ul>

      <h3>Коментарі</h3>
      <ul className="list-group mb-3">
        {(order.comments || []).map((c, i) => (
          <li key={i} className="list-group-item">
            <strong>{c.author}:</strong> {c.text}
          </li>
        ))}
      </ul>
      <NoteForm onAddNote={addComment} />
    </div>
  );
};

export default OrderDetails;
