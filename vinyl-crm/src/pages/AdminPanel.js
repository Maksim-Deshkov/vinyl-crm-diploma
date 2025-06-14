import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [newManager, setNewManager] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    axios.get('http://localhost:3001/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Помилка завантаження користувачів:', err));
  };

  const addManager = () => {
    if (!newManager.name || !newManager.email || !newManager.password) {
      alert('Заповніть усі поля');
      return;
    }
    axios.post('http://localhost:3001/users', { ...newManager, role: 'manager' })
      .then(() => {
        loadUsers();
        setNewManager({ name: '', email: '', password: '' });
      })
      .catch(err => console.error('Помилка додавання менеджера:', err));
  };

  const deleteUser = (id) => {
    axios.delete(`http://localhost:3001/users/${id}`)
      .then(loadUsers)
      .catch(err => console.error('Помилка видалення:', err));
  };

  return (
    <div>
      <h2>Адмін панель</h2>
      <h3>Додати менеджера</h3>
      <input placeholder="Ім'я" value={newManager.name} onChange={e => setNewManager({ ...newManager, name: e.target.value })} /><br/>
      <input placeholder="Email" value={newManager.email} onChange={e => setNewManager({ ...newManager, email: e.target.value })} /><br/>
      <input placeholder="Пароль" type="password" value={newManager.password} onChange={e => setNewManager({ ...newManager, password: e.target.value })} /><br/>
      <button onClick={addManager}>Додати</button>

      <h3>Список персоналу</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th><th>Ім'я</th><th>Email</th><th>Роль</th><th>Дія</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                {u.role !== 'admin' && (
                  <button onClick={() => deleteUser(u.id)}>Видалити</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
