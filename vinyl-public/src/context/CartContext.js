import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (vinyl) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === vinyl.id);
      if (existing) {
        return prev.map(i =>
          i.id === vinyl.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...vinyl, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCart(prev => prev.map(i =>
      i.id === id ? { ...i, quantity } : i
    ));
  };

  const applyPromo = (code) => {
    if (code === 'VINYL10') {
      setPromo({ code, discount: 0.10 });
    } else {
      setPromo(null);
    }
  };

  const clearCart = () => {
    setCart([]);
    setPromo(null);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, promo, applyPromo, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
