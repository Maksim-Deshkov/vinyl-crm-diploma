import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ModerateReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/reviews')
      .then(res => setReviews(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = id => {
    if (!window.confirm('Видалити цей коментар?')) return;
    api.delete(`/reviews/${id}`).then(() => {
      setReviews(reviews => reviews.filter(r => r._id !== id));
    });
  };

  const filtered = reviews.filter(r =>
    (r.text?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.vinylId?._id).includes(search))
  );

  return (
    <div className="moderate-reviews">
      <h2>🛡 Модерування коментарів</h2>
      <div className="mod-rev-controls">
        <input
          type="text"
          placeholder="Пошук по тексту або id платівки"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span>Загалом: {filtered.length}</span>
      </div>
      <div className="mod-rev-table-wrapper">
        <table className="mod-rev-table">
          <thead>
            <tr>
              <th>Платівка</th>
              <th>Користувач</th>
              <th>Оцінка</th>
              <th>Текст</th>
              <th>Дата</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{textAlign:'center'}}>Завантаження...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign:'center'}}>Немає коментарів</td></tr>
            ) : filtered.map(r => (
              <tr key={r._id}>
                <td>
                  <div>
                    <strong>{r.vinylId?.title || '—'}</strong>
                  </div>
                  <div style={{fontSize:'0.95em', color:'#9a93be'}}>
                    {r.vinylId?.artist || '—'}<br/>
                    <span style={{fontSize:'0.9em'}}>ID: {r.vinylId?._id || '—'}</span>
                  </div>
                </td>
                <td>
                  <div>
                    <strong>{r.userId?.name || '—'}</strong>
                  </div>
                  <div style={{fontSize:'0.95em', color:'#9a93be'}}>
                    <span style={{fontSize:'0.9em'}}>ID: {r.userId?._id || '—'}</span>
                  </div>
                </td>
                <td>
                  <span className="rev-rating">{r.rating}</span>
                </td>
                <td className="rev-text">{r.text}</td>
                <td>{r.date ? new Date(r.date).toLocaleString() : ''}</td>
                <td>
                  <button className="btn-delete" onClick={() => handleDelete(r._id)}>
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModerateReviews;
