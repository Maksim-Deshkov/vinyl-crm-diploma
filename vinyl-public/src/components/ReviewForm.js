import React, { useState } from 'react';
import axios from 'axios';

const ReviewForm = ({ vinylId, onReviewAdded }) => {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!author || !text) {
      alert('Будь ласка, заповніть усі поля!');
      return;
    }

    axios.post('http://localhost:3001/reviews', {
      vinylId,
      author,
      text
    })
    .then(() => {
      setAuthor('');
      setText('');
      onReviewAdded();
    })
    .catch(err => console.error(err));
  };

  return (
    <div>
      <h4>Додати відгук</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ваше ім'я"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          style={{ display: 'block', marginBottom: '0.5rem' }}
        />
        <textarea
          placeholder="Ваш відгук"
          value={text}
          onChange={e => setText(e.target.value)}
          style={{ display: 'block', marginBottom: '0.5rem', width: '100%', height: '100px' }}
        />
        <button type="submit">Надіслати</button>
      </form>
    </div>
  );
};

export default ReviewForm;
