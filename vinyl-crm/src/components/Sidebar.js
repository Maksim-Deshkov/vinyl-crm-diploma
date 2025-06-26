import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // optional styling

const Sidebar = () => (
  <aside className="sidebar">
    <nav>
      <NavLink to="/" end>Дашборд</NavLink>
      <NavLink to="/orders">Замовлення</NavLink>
      <NavLink to="/vinyls">Платівки</NavLink>
      <NavLink to="/users">Користувачі</NavLink>
      <NavLink to="/admin">Адмін панель</NavLink>
    </nav>
  </aside>
);

export default Sidebar;
