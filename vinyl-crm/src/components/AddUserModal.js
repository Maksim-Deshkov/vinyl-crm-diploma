import React, { useState } from 'react';

const ROLES = [
  { value: 'admin', label: 'Адмін' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'user', label: 'Користувач' }
];

const AddUserModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'user', address: '', phone: ''
  });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) {
      alert('Заповніть всі обовʼязкові поля');
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Додати нового користувача</h3>

        <label>Ім'я*</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />

        <label>Email*</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />

        <label>Пароль*</label>
        <input
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />

        <label>Роль*</label>
        <select
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          {ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        <label>Адреса</label>
        <input
          type="text"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
        />

        <label>Телефон</label>
        <input
          type="text"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
        />

        <div className="modal-actions">
          <button onClick={handleSubmit}>Зберегти</button>
          <button onClick={onClose}>Скасувати</button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
