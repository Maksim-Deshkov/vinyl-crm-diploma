import React, { useState, useEffect } from 'react';
import api from '../services/api';

const VinylModal = ({ vinyl, onClose }) => {
  const [form, setForm] = useState({
    title: '',
    artist: '',
    genre: '',
    price: '',
    description: '',
    stock: '',
    warehouseLocation: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const API_ROOT = api.defaults.baseURL.replace(/\/api\/?$/, '');

  useEffect(() => {
    if (vinyl) {
      setForm({
        title: vinyl.title || '',
        artist: vinyl.artist || '',
        genre: vinyl.genre || '',
        price: vinyl.price || '',
        description: vinyl.description || '',
        stock: vinyl.inventory?.stock || '',
        warehouseLocation: vinyl.inventory?.warehouseLocation || ''
      });
      setImagePreview(vinyl.cover ? `${API_ROOT}/uploads/${vinyl.cover}` : null);
    } else {
      setForm({
        title: '',
        artist: '',
        genre: '',
        price: '',
        description: '',
        stock: '',
        warehouseLocation: ''
      });
      setImagePreview(null);
    }
    setImage(null);
  }, [vinyl, API_ROOT]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('artist', form.artist);
    formData.append('genre', form.genre);
    formData.append('price', form.price);
    formData.append('description', form.description);
    formData.append('inventory.stock', form.stock);
    formData.append('inventory.warehouseLocation', form.warehouseLocation);
    if (image) formData.append('cover', image);

    try {
      if (vinyl && vinyl._id) {
        await api.patch(`/vinyls/${vinyl._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/vinyls', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onClose(true);
    } catch (err) {
      alert('Не вдалося зберегти платівку');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content vinyl-modal">
        <h3>{vinyl ? 'Редагувати платівку' : 'Додати платівку'}</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label htmlFor="title">Назва</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="Назва"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="artist">Виконавець</label>
          <input
            id="artist"
            type="text"
            name="artist"
            placeholder="Виконавець"
            value={form.artist}
            onChange={handleChange}
            required
          />

          <label htmlFor="genre">Жанр</label>
          <input
            id="genre"
            type="text"
            name="genre"
            placeholder="Жанр"
            value={form.genre}
            onChange={handleChange}
          />

          <label htmlFor="price">Ціна, грн</label>
          <input
            id="price"
            type="number"
            name="price"
            placeholder="Ціна, грн"
            value={form.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />

          <label htmlFor="description">Опис платівки</label>
          <textarea
            id="description"
            className="vinyl-desc"
            name="description"
            placeholder="Опис платівки"
            value={form.description}
            onChange={handleChange}
            rows={4}
            style={{ resize: 'vertical', marginBottom: 10 }}
          />

          <label htmlFor="stock">Кількість у наявності</label>
          <input
            id="stock"
            type="number"
            name="stock"
            placeholder="Кількість"
            value={form.stock}
            onChange={handleChange}
            min="0"
          />

          <label htmlFor="warehouseLocation">Склад</label>
          <input
            id="warehouseLocation"
            type="text"
            name="warehouseLocation"
            placeholder="Назва або адреса складу"
            value={form.warehouseLocation}
            onChange={handleChange}
          />

          <label htmlFor="cover">Обкладинка</label>
          <input
            id="cover"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Прев’ю обкладинки" />
            </div>
          )}

          <div className="modal-buttons">
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
            <button type="button" className="btn-cancel" onClick={() => onClose(false)} disabled={saving}>
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VinylModal;
