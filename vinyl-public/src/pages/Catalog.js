import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const Catalog = () => {
  const [vinyls, setVinyls] = useState([]);
  const [filteredVinyls, setFilteredVinyls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sort, setSort] = useState('');
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    axios.get('http://localhost:3001/vinyls')
      .then(res => {
        setVinyls(res.data);
        setFilteredVinyls(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let results = vinyls;

    // Пошук по назві
    if (searchTerm) {
      results = results.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фільтр за жанром
    if (genre) {
      results = results.filter(v => v.genre === genre);
    }

    // Фільтр за ціною
    if (priceRange.min) {
      results = results.filter(v => v.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      results = results.filter(v => v.price <= parseFloat(priceRange.max));
    }

    // Сортування
    if (sort === 'priceAsc') {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (sort === 'priceDesc') {
      results = [...results].sort((a, b) => b.price - a.price);
    } else if (sort === 'title') {
      results = [...results].sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredVinyls(results);
  }, [searchTerm, genre, priceRange, sort, vinyls]);

  return (
    <div>
      <h2>Каталог платівок</h2>

      {/* Форма пошуку, фільтрів та сортування */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Пошук по назві"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <select value={genre} onChange={e => setGenre(e.target.value)} style={{ marginRight: '1rem' }}>
          <option value="">Всі жанри</option>
          <option value="Рок">Рок</option>
          <option value="Поп">Поп</option>
          <option value="Джаз">Джаз</option>
          <option value="Класика">Класика</option>
        </select>
        <input
          type="number"
          placeholder="Мін. ціна"
          value={priceRange.min}
          onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
          style={{ marginRight: '0.5rem', width: '100px' }}
        />
        <input
          type="number"
          placeholder="Макс. ціна"
          value={priceRange.max}
          onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
          style={{ width: '100px', marginRight: '1rem' }}
        />
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Сортувати</option>
          <option value="priceAsc">Ціна ↑</option>
          <option value="priceDesc">Ціна ↓</option>
          <option value="title">Назва</option>
        </select>
      </div>

      {/* Список платівок */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {filteredVinyls.length > 0 ? (
          filteredVinyls.map(vinyl => (
            <div key={vinyl.id} style={{ border: '1px solid #ccc', padding: '1rem', width: '200px' }}>
              <img src={vinyl.cover} alt={vinyl.title} style={{ width: '100%' }} />
              <h3>{vinyl.title}</h3>
              <p>{vinyl.artist}</p>
              <p>{vinyl.genre}</p>
              <p>{vinyl.price} грн</p>
              {vinyl.hit && <p style={{ color: 'red' }}>🔥 Хіт продажів</p>}
              <Link to={`/vinyl/${vinyl.id}`} style={{ display: 'block', marginBottom: '0.5rem' }}>Детальніше</Link>
              <button onClick={() => addToCart(vinyl)}>Додати в кошик</button>
            </div>
          ))
        ) : (
          <p>Не знайдено платівок за вашим запитом.</p>
        )}
      </div>
    </div>
  );
};

export default Catalog;
