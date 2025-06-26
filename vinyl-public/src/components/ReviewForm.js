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
    axios.post('http://localhost:3001/reviews', { vinylId, author, text })
      .then(() => {
        setAuthor('');
        setText('');
        onReviewAdded();
      })
      .catch(console.error);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mt-4">
      <h5 className="font-semibold mb-2">Додати відгук</h5>
      <input
        type="text"
        placeholder="Ваше ім'я"
        value={author}
        onChange={e => setAuthor(e.target.value)}
        className="w-full border rounded p-2 mb-2"
      />
      <textarea
        placeholder="Ваш відгук"
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full border rounded p-2 mb-2"
        rows="3"
      />
      <button type="submit" className="bg-mint text-white py-1 px-3 rounded hover:bg-mint-dark">Надіслати</button>
    </form>
  );
};

export default ReviewForm;