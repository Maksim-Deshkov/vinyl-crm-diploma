import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReviewList = ({ vinylId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3001/reviews?vinylId=${vinylId}`)
      .then(res => setReviews(res.data))
      .catch(err => console.error(err));
  }, [vinylId]);

  return (
    <div>
      <h3>Відгуки</h3>
      {reviews.length > 0 ? (
        <ul>
          {reviews.map(r => (
            <li key={r.id}>
              <strong>{r.author}:</strong> {r.text}
            </li>
          ))}
        </ul>
      ) : (
        <p>Відгуків поки немає.</p>
      )}
    </div>
  );
};

export default ReviewList;
