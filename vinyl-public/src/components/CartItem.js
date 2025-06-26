import React from 'react';

const CartItem = ({ item, removeFromCart, updateQuantity }) => (
  <div className="flex justify-between items-center bg-white p-2 rounded shadow mb-2">
    <div>
      {item.title} — {item.price} грн x
      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={e => updateQuantity(item.id, Number(e.target.value))}
        className="w-16 ml-2 border rounded p-1"
      />
    </div>
    <button className="bg-pink-light text-white py-1 px-2 rounded hover:bg-pink-200" onClick={() => removeFromCart(item.id)}>
      Видалити
    </button>
  </div>
);
export default CartItem;