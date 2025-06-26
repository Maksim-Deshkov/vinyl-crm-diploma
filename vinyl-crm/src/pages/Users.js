import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [roleFilter, setRoleFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, roleFilter, emailFilter, nameFilter, statusFilter, phoneFilter]);

  const loadUsers = () => {
    api.get('/users')
      .then(res => {
        console.log('Завантажено користувачів:', res.data);
        setUsers(res.data);
      })
      .catch(err => console.error('Помилка завантаження користувачів:', err));
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (roleFilter) {
      filtered = filtered.filter(u => u.role.toLowerCase().includes(roleFilter.toLowerCase()));
    }
    if (emailFilter) {
      filtered = filtered.filter(u => u.email.toLowerCase().includes(emailFilter.toLowerCase()));
    }
    if (nameFilter) {
      filtered = filtered.filter(u => u.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (statusFilter) {
      filtered = filtered.filter(u =>
        statusFilter === 'active' ? !u.isFrozen : u.isFrozen
      );
    }
    if (phoneFilter) {
      filtered = filtered.filter(u => (u.phone || '').toLowerCase().includes(phoneFilter.toLowerCase()));
    }

    setFilteredUsers(filtered);
  };

  return (
    <div className="users_element-container">
      <h2>Список користувачів</h2>

      <div className="users_element-filters">
        <input
          type="text"
          placeholder="Фільтр за ім’ям"
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Фільтр за email"
          value={emailFilter}
          onChange={e => setEmailFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Фільтр за телефоном"
          value={phoneFilter}
          onChange={e => setPhoneFilter(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">Усі ролі</option>
          <option value="admin">Адміністратор</option>
          <option value="manager">Менеджер</option>
          <option value="user">Клієнт</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Усі статуси</option>
          <option value="active">Активні</option>
          <option value="frozen">Заморожені</option>
        </select>
      </div>

      <div className="users_element-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ім’я</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Адреса</th>
              <th>Аватар</th>
              <th>Кошик</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u._id}>
                <td>{u._id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td>{u.role}</td>
                <td>{u.isFrozen ? 'Заморожено' : 'Активний'}</td>
                <td>{u.address || '—'}</td>
                <td>
                  {u.avatar ? (
                    <img src={u.avatar} alt="avatar" width="40" />
                  ) : '—'}
                </td>
                <td>
                  {u.cart && u.cart.length > 0 ? (
                    <ul>
                      {u.cart.map((item, i) => (
                        <li key={i}>
                          ID: {item._id}, кількість: {item.count}
                        </li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
