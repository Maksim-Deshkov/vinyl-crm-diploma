import React from 'react';

const CartItem = ({ item, removeFromCart, updateQuantity }) => (
  <div>
    {item.title} — {item.price} грн x
    <input
      type="number"
      min="1"
      value={item.quantity}
      onChange={e => updateQuantity(item.id, Number(e.target.value))}
      style={{ width: '50px' }}
    />
    <button onClick={() => removeFromCart(item.id)}>Видалити</button>
  </div>
);

export default CartItem;
