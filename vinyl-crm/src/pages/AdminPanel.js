import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AddUserModal from '../components/AddUserModal';

const ROLES = ['admin', 'manager', 'user', 'moder'];

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = () => {
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Помилка завантаження користувачів:', err));
  };

  const handleAddUser = (newUser) => {
    api.post('/users', newUser)
      .then(() => { loadUsers(); setShowModal(false); })
      .catch(err => console.error('Помилка додавання користувача:', err));
  };

  const toggleFreeze = (id, currentState) => {
    if (!window.confirm(currentState ? 'Розморозити акаунт?' : 'Заморозити акаунт?')) return;
    api.patch(`/users/${id}/freeze`, { isFrozen: !currentState })
      .then(() => loadUsers())
      .catch(err => alert('Помилка зміни статусу заморозки'));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Видалити користувача?')) return;
    api.delete(`/users/${id}`)
      .then(() => loadUsers())
      .catch(err => alert('Помилка видалення користувача'));
  };

  const handleRoleChange = (id, newRole) => {
    if (!window.confirm(`Змінити роль користувача на "${newRole}"?`)) return;
    api.patch(`/users/${id}/role`, { role: newRole })
      .then(() => loadUsers())
      .catch(err => alert('Помилка зміни ролі'));
  };

  const filteredUsers = users
    .filter(u => (filterRole === 'All' ? true : u.role === filterRole))
    .filter(u => !search || 
      (u.name?.toLowerCase().includes(search.toLowerCase()) || 
       u.email?.toLowerCase().includes(search.toLowerCase())));

  const roleStats = ROLES.map(role => ({
    role,
    count: users.filter(u => u.role === role).length
  }));

  return (
    <div className="admin-panel">
      <h2>👑 Адмін-панель</h2>

      <div className="controls">
        <label>Фільтр за роллю:</label>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="All">Всі</option>
          {ROLES.map(r => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Пошук за email чи ім'ям"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 10 }}
        />
        <button className="add-admin-btn" onClick={() => setShowModal(true)}>
          ＋ Додати користувача
        </button>
      </div>

      <div className="role-stats">
        {roleStats.map(rs => (
          <span key={rs.role} style={{ marginRight: 14 }}>
            {rs.role}: <b>{rs.count}</b>
          </span>
        ))}
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Ім'я</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(u => (
            <tr key={u._id} className={u.isFrozen ? 'frozen' : ''}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u._id, e.target.value)}
                  disabled={u.isFrozen}
                  style={{ background: u.role === 'admin' ? '#e0e0fa' : undefined }}
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td style={u.isFrozen ? { color: '#d00', fontWeight: 'bold' } : {}}>
                {u.isFrozen ? 'Заморожено' : 'Активний'}
              </td>
              <td>
                <button
                  className={u.isFrozen ? "btn-unfreeze" : "btn-freeze"}
                  onClick={() => toggleFreeze(u._id, u.isFrozen)}
                >
                  {u.isFrozen ? 'Розморозити' : 'Заморозити'}
                </button>
                <button
                  className="btn-delete"
                  style={{ marginLeft: 8, color: '#a22' }}
                  onClick={() => handleDelete(u._id)}
                  disabled={u.role === 'admin'}
                  title={u.role === 'admin' ? 'Не можна видалити адміна' : 'Видалити'}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onSave={handleAddUser}
        />
      )}
    </div>
  );
};

export default AdminPanel;
