import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Ласкаво просимо до магазину вінілових платівок</h1>
      <p>Перегляньте наш <Link to="/catalog">каталог</Link>!</p>
    </div>
  );
};

export default Home;
