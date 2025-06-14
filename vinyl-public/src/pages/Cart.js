import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, promo, applyPromo, clearCart, user } = useContext(CartContext);
  const [promoCode, setPromoCode] = useState('');
  const [orderInfo, setOrderInfo] = useState({ name: '', address: '' });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promo ? total * promo.discount : 0;
  const finalTotal = total - discount;

  const handleOrder = () => {
    if (!orderInfo.name || !user || !orderInfo.address) {
      alert('Заповніть усі поля форми!');
      return;
    }

    const order = {
      customerName: orderInfo.name,
      email: user,
      address: orderInfo.address,
      total: finalTotal,
      items: cart,
      status: 'Нове'
    };

    axios.post('http://localhost:3001/orders', order)
      .then(() => {
        alert('Замовлення оформлено успішно!');
        clearCart();
      })
      .catch(err => {
        console.error('Помилка оформлення замовлення:', err);
        alert('Не вдалося оформити замовлення');
      });
  };

  return (
    <div>
      <h2>Ваш кошик</h2>
      {cart.length === 0 ? <p>Кошик порожній</p> : (
        <div>
          {cart.map(item => (
            <CartItem
              key={item.id}
              item={item}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
            />
          ))}
          <div>
            <input
              type="text"
              placeholder="Промокод"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value)}
            />
            <button onClick={() => applyPromo(promoCode)}>Застосувати</button>
          </div>
          <p>Сума: {total} грн</p>
          {promo && <p>Знижка: -{discount} грн</p>}
          <p><strong>До сплати: {finalTotal} грн</strong></p>

          <h3>Оформлення замовлення</h3>
          <input placeholder="Ім'я" onChange={e => setOrderInfo({ ...orderInfo, name: e.target.value })} /><br/>
          <input placeholder="Адреса" onChange={e => setOrderInfo({ ...orderInfo, address: e.target.value })} /><br/>
          <button onClick={handleOrder}>Оформити</button>
        </div>
      )}
    </div>
  );
};

export default Cart;
