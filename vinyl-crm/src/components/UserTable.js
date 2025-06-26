import React, { useState } from 'react';

const UserTable = ({ users, onToggleBlock }) => {
  const [sortKey, setSortKey] = useState('id');

  const sorted = [...users].sort((a, b) =>
    a[sortKey] > b[sortKey] ? 1 : -1
  );

  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th onClick={() => setSortKey('id')}>ID</th>
          <th onClick={() => setSortKey('name')}>Ім’я</th>
          <th onClick={() => setSortKey('email')}>Email</th>
          <th>Статус</th>
          <th>Дія</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(u => (
          <tr key={u.id}>
            <td>{u.id}</td>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.blocked ? 'Заблоковано' : 'Активний'}</td>
            <td>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => onToggleBlock(u.id, !u.blocked)}
              >
                {u.blocked ? 'Розблокувати' : 'Заблокувати'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
