import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Завантажити кошик із сервера
  const loadCartFromServer = async (userId) => {
    try {
      const res = await api.get(`/users/${userId}`);
      const cart = res.data.cart || [];
      const items = cart.map(item => ({
        _id: item._id._id,
        title: item._id.title,
        price: item._id.price,
        cover: item._id.cover,
        quantity: item.count
      }));
      setCartItems(items);
    } catch (err) {
      console.error("Помилка завантаження кошика:", err);
      setCartItems([]);
    }
  };

  // Додати товар
  const addToCart = async (vinyl) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user._id) {
        await api.patch(`/users/${user._id}/cart`, { productId: vinyl._id });
        await loadCartFromServer(user._id);
      } else {
        setCartItems(prev => {
          const existing = prev.find(i => i._id === vinyl._id);
          if (existing) {
            return prev.map(i => i._id === vinyl._id ? { ...i, quantity: i.quantity + 1 } : i);
          }
          return [...prev, { ...vinyl, quantity: 1 }];
        });
      }
    } catch (err) {
      console.error("Помилка додавання товару:", err);
    }
  };

  // Оновити кількість
  const updateQuantity = async (productId, qty) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (qty <= 0) {
      await removeFromCart(productId);
      return;
    }
    if (user && user._id) {
      await api.patch(`/users/${user._id}/cart`, { productId, count: qty });
      await loadCartFromServer(user._id);
    } else {
      setCartItems(prev =>
        prev.map(i => (i._id === productId ? { ...i, quantity: qty } : i))
      );
    }
  };

  // Видалити товар
  const removeFromCart = async (productId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user._id) {
      await api.patch(`/users/${user._id}/cart/remove`, { productId });
      await loadCartFromServer(user._id);
    } else {
      setCartItems(prev => prev.filter(i => i._id !== productId));
    }
  };

  // Очистити кошик
  const clearCart = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user._id) {
      await api.patch(`/users/${user._id}/cart/clear`);
      setCartItems([]);
    } else {
      setCartItems([]);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loadCartFromServer
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
