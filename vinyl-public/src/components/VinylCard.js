import React from 'react';

const VinylCard = ({ vinyl, addToCart }) => (
  <div style={{ border: '1px solid #ccc', margin: '8px', padding: '8px' }}>
    <strong>{vinyl.title}</strong> ({vinyl.genre})
    {vinyl.hit && <span style={{ color: 'red' }}> 🔥 Хіт</span>}
    <div>{vinyl.price} грн</div>
    <button onClick={() => addToCart(vinyl)}>Додати в кошик</button>
  </div>
);

export default VinylCard;
