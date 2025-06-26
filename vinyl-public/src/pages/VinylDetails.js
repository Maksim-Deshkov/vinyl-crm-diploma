import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const VinylDetails = () => {
  const { id } = useParams();
  const [vinyl, setVinyl] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ text: '', rating: 5 });

  useEffect(() => {
    api.get(`/vinyls/${id}`)
      .then(res => setVinyl(res.data))
      .catch(console.error);

    api.get(`/reviews?vinylId=${id}`)
      .then(res => setComments(res.data))
      .catch(console.error);
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.text.trim()) return;
    try {
      // Отримуємо поточного користувача з localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        alert('Потрібно увійти для додавання відгуку.');
        return;
      }

      const res = await api.post('/reviews', { 
        vinylId: id, 
        userId: user._id,
        text: newComment.text, 
        rating: newComment.rating 
      });

      setComments(prev => [...prev, res.data]);
      setNewComment({ text: '', rating: 5 });
    } catch (err) {
      console.error('Помилка додавання коментаря', err);
    }
  };

  if (!vinyl) {
    return <div className="vinyl-details">Завантаження...</div>;
  }

  const averageRating = comments.length
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : '—';

  return (
    <div className="vinyl-details">
      <div className="vinyl-info">
        <img
          src={vinyl.cover ? `${api.defaults.baseURL.replace(/\/api\/?$/, '')}/uploads/${vinyl.cover}` : '/default-cover.png'}
          alt={vinyl.title}
        />
        <div className="vinyl-data">
          <h2>{vinyl.title}</h2>
          <p className="artist">{vinyl.artist}</p>
          <p className="price">{vinyl.price} грн</p>
          <p className="desc">{vinyl.description || 'Немає опису.'}</p>
          <p className="stats">Оцінка: {averageRating} / 5.0</p>
          <p className="stats">Кількість покупок: {vinyl.soldCount ?? '—'}</p>
        </div>
      </div>
      <div className="vinyl-comments">
        <h3>Відгуки</h3>
        {comments.length === 0 ? (
          <p>Відгуків поки немає.</p>
        ) : (
          <ul>
            {comments.map(c => (
              <li key={c._id}>
                <p>
                  <strong>{c.userId?.name || 'Користувач'}</strong> ({c.rating}/5)
                </p>
                <p>{c.text}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="comment-form">
          <textarea 
            value={newComment.text}
            onChange={e => setNewComment({ ...newComment, text: e.target.value })}
            placeholder="Ваш відгук..."
          />
          <div className="rating-control">
            <label>Оцінка:</label>
            <select
              value={newComment.rating}
              onChange={e => setNewComment({ ...newComment, rating: +e.target.value })}
            >
              {[5,4,3,2,1].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAddComment}>Додати відгук</button>
        </div>
      </div>
    </div>
  );
};

export default VinylDetails;
