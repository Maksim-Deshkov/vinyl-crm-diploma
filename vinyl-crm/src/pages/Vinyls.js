import React, { useEffect, useState } from 'react';
import api from '../services/api';
import VinylModal from '../components/VinylModal';
import VinylTable from '../components/VinylTable';

const Vinyls = () => {
  const [vinyls, setVinyls] = useState([]);
  const [filteredVinyls, setFilteredVinyls] = useState([]);

  const [titleFilter, setTitleFilter] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVinyl, setEditingVinyl] = useState(null);

  useEffect(() => {
    loadVinyls();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vinyls, titleFilter, artistFilter, genreFilter, minPrice, maxPrice]);

  const loadVinyls = () => {
    api.get('/vinyls')
      .then(res => {
        setVinyls(res.data);
        setFilteredVinyls(res.data);
      })
      .catch(err => console.error('Помилка завантаження платівок:', err));
  };

  const applyFilters = () => {
    let filtered = [...vinyls];

    if (titleFilter) {
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    if (artistFilter) {
      filtered = filtered.filter(v =>
        v.artist.toLowerCase().includes(artistFilter.toLowerCase())
      );
    }

    if (genreFilter) {
      filtered = filtered.filter(v =>
        v.genre.toLowerCase().includes(genreFilter.toLowerCase())
      );
    }

    if (minPrice) {
      filtered = filtered.filter(v => v.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter(v => v.price <= parseFloat(maxPrice));
    }

    setFilteredVinyls(filtered);
  };

  const handleDelete = (id) => {
    if (window.confirm('Видалити цю платівку?')) {
      api.delete(`/vinyls/${id}`)
        .then(loadVinyls)
        .catch(err => alert('Помилка видалення платівки'));
    }
  };

  const handleEdit = (vinyl) => {
    setEditingVinyl(vinyl);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingVinyl(null);
    setModalOpen(true);
  };

  const handleModalClose = (refresh) => {
    setModalOpen(false);
    setEditingVinyl(null);
    if (refresh) loadVinyls();
  };

  return (
    <div className="vinyls_container">
      <h2>Каталог платівок</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Назва"
          value={titleFilter}
          onChange={e => setTitleFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Виконавець"
          value={artistFilter}
          onChange={e => setArtistFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Жанр"
          value={genreFilter}
          onChange={e => setGenreFilter(e.target.value)}
        />
        <input
          type="number"
          placeholder="Ціна від"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Ціна до"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
        />
      </div>

      <button className="btn-add" onClick={handleAdd}>Додати платівку</button>

      <VinylTable
        vinyls={filteredVinyls}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showId={true}
        showStock={true}
      />

      {modalOpen && (
        <VinylModal
          vinyl={editingVinyl}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Vinyls;
