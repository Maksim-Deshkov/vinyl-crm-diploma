import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    axios.get('http://localhost:3001/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Помилка завантаження користувачів:', err));
  };

  const toggleBlock = async (id, blocked) => {
    try {
      await axios.patch(`http://localhost:3001/users/${id}`, { blocked });
      setUsers(prev =>
        prev.map(u => u.id === id ? { ...u, blocked } : u)
      );
    } catch (err) {
      console.error('Помилка зміни статусу блокування:', err);
      alert('Не вдалося змінити статус користувача');
    }
  };

  return (
    <div>
      <h2>Список користувачів</h2>
      <table border="1" cellPadding="5" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ім'я</th>
            <th>Email</th>
            <th>Статус</th>
            <th>Дія</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.blocked ? 'Заблоковано' : 'Активний'}</td>
              <td>
                <button onClick={() => toggleBlock(u.id, !u.blocked)}>
                  {u.blocked ? 'Розблокувати' : 'Заблокувати'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
