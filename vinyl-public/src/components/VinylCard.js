import React from 'react';

const VinylCard = ({ vinyl, addToCart }) => (
  <div className="bg-white rounded shadow p-4 hover:shadow-lg transition">
    <img src={vinyl.image || 'placeholder.jpg'} alt={vinyl.title} className="mb-2 rounded" />
    <div className="font-bold">{vinyl.title}</div>
    <div className="text-sm text-gray-500">{vinyl.genre}</div>
    {vinyl.hit && <div className="text-pink-500">🔥 Хіт</div>}
    <div className="mt-1">{vinyl.price} грн</div>
    <button className="mt-2 bg-mint text-white py-1 px-3 rounded hover:bg-mint-dark" onClick={() => addToCart(vinyl)}>
      Додати в кошик
    </button>
  </div>
);
export default VinylCard;