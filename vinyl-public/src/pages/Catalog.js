import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';

const Catalog = () => {
  const [vinyls, setVinyls] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [genre, setGenre] = useState('');
  const { addToCart } = useContext(CartContext);

  const API_ROOT = api.defaults.baseURL.replace(/\/api\/?$/, '');

  useEffect(() => {
    api.get('/vinyls')
      .then(res => {
        setVinyls(res.data);
        setFiltered(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let data = [...vinyls];
    if (search) data = data.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));
    if (authorSearch) data = data.filter(v => v.artist.toLowerCase().includes(authorSearch.toLowerCase()));
    if (genre) data = data.filter(v => v.genre === genre);
    setFiltered(data);
  }, [search, authorSearch, genre, vinyls]);

  const genres = Array.from(new Set(vinyls.map(v => v.genre))).filter(g => g);

  return (
    <div className="catalog-container">
      <h2>Каталог платівок</h2>
      <div className="filters simple-filters">
        <input type="text" placeholder="🔍 Шукати за назвою" value={search} onChange={e => setSearch(e.target.value)} />
        <input type="text" placeholder="🎤 Шукати за виконавцем" value={authorSearch} onChange={e => setAuthorSearch(e.target.value)} />
        <select value={genre} onChange={e => setGenre(e.target.value)}>
          <option value="">📂 Усі жанри</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="catalog-grid">
        {filtered.map(v => (
          <div key={v._id} className="vinyl-card simple-card">
            <Link to={`/vinyl/${v._id}`}>
              <img src={v.cover ? `${API_ROOT}/uploads/${v.cover}` : '/default-cover.png'} alt={v.title} />
              <div className="card-info">
                <h3>{v.title}</h3>
                <p className="artist">{v.artist}</p>
                <p className="price">{v.price} грн</p>
              </div>
            </Link>
            <button onClick={() => addToCart(v)} className="add-btn">+ Кошик</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
