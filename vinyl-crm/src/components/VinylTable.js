import React, { useState } from 'react';
import api from '../services/api';

const VinylTable = ({ vinyls, onEdit, onDelete, showStock = false }) => {
  const [sortKey, setSortKey] = useState('title');
  const API_ROOT = api.defaults.baseURL.replace(/\/api\/?$/, '');

  const sorted = [...vinyls].sort((a, b) => {
    const aValue = a[sortKey] || '';
    const bValue = b[sortKey] || '';
    if (aValue > bValue) return 1;
    if (aValue < bValue) return -1;
    return 0;
  });

  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th onClick={() => setSortKey('title')}>Назва</th>
          <th onClick={() => setSortKey('artist')}>Виконавець</th>
          <th onClick={() => setSortKey('genre')}>Жанр</th>
          <th onClick={() => setSortKey('price')}>Ціна</th>
          {showStock && <th>Наявність / Склад</th>}
          <th>Обкладинка</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(v => {
          const src = v.cover ? `${API_ROOT}/uploads/${v.cover}` : '/default-cover.png';
          const stock = v.inventory?.stock ?? '—';
          const location = v.inventory?.warehouseLocation || '—';
          return (
            <tr key={v._id}>
              <td>{v.title}</td>
              <td>{v.artist}</td>
              <td>{v.genre}</td>
              <td>{v.price}</td>
              {showStock && (
                <td>
                  {stock} шт.
                  <br />
                  <small className="text-muted">{location}</small>
                </td>
              )}
              <td>
                {v.cover && (
                  <img src={src} alt="cover" style={{ maxWidth: 48, maxHeight: 48, borderRadius: 4 }} />
                )}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => onEdit(v)}
                >
                  Редагувати
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(v._id)}
                >
                  Видалити
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default VinylTable;
