// FloatingFilter.js
import React, { useState } from 'react';

const FloatingFilter = ({ onFilterChange }) => {
  const [visible, setVisible] = useState(true);
  const [filters, setFilters] = useState({
    title: '',
    genre: '',
    price: '',
    author: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className={`floating-filter ${visible ? 'visible' : 'hidden'}`}>
      <button className="toggle-button" onClick={() => setVisible(!visible)}>
        {visible ? 'Згорнути' : 'Фільтри'}
      </button>
      {visible && (
        <div className="filter-content">
          <label>Назва</label>
          <input name="title" value={filters.title} onChange={handleChange} placeholder="Назва" />
          <label>Жанр</label>
          <input name="genre" value={filters.genre} onChange={handleChange} placeholder="Жанр" />
          <label>Ціна</label>
          <input name="price" value={filters.price} onChange={handleChange} placeholder="Ціна" type="number" />
          <label>Автор</label>
          <input name="author" value={filters.author} onChange={handleChange} placeholder="Автор" />
        </div>
      )}
    </div>
  );
};

export default FloatingFilter;