import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

const VinylDetails = () => {
  const { id } = useParams();
  const [vinyl, setVinyl] = useState(null);
  const [reloadReviews, setReloadReviews] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:3001/vinyls/${id}`)
      .then(res => setVinyl(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const refreshReviews = () => setReloadReviews(prev => !prev);

  if (!vinyl) return <p>Завантаження...</p>;

  return (
    <div>
      <h2>{vinyl.title}</h2>
      <img src={vinyl.cover} alt={vinyl.title} style={{ width: '300px' }} />
      <p>Виконавець: {vinyl.artist}</p>
      <p>Жанр: {vinyl.genre}</p>
      <p>Ціна: {vinyl.price} грн</p>
      <p>Опис: {vinyl.description}</p>
      <button>Додати до кошика</button>

      <ReviewList key={reloadReviews} vinylId={vinyl.id} />
      <ReviewForm vinylId={vinyl.id} onReviewAdded={refreshReviews} />
    </div>
  );
};

export default VinylDetails;
