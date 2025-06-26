import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Ласкаво просимо до Vinyl Market</h1>
        <p>Тут кожна платівка має свою історію, а музика стає душею вашого простору.</p>
      </header>
      <section className="home-intro">
        <div className="intro-text">
          <h2>Магазин із душею</h2>
          <p>Vinyl CRM — це більше ніж магазин. Це легенда, яка бере свій початок у 1978 році, коли невелика родинна крамниця у Львові почала збирати рідкісні платівки для справжніх поціновувачів музики. З того часу ми перетворилися на найбільший вініловий хаб у країні, де зберігаються унікальні записи з усього світу. Наша мета — зберегти автентичність звучання і подарувати вам емоції, яких не знайдеш у цифровому світі.</p>
          <p>У нашій колекції — від класики джазу до сучасного інді-року. Ми працюємо для тих, хто любить музику серцем.</p>
          <Link to="/catalog" className="explore-button">Переглянути каталог</Link>
        </div>
        <div className="intro-images">
          <img src="/main-store.png" alt="Головне зображення магазину" className="main-image" />
          <div className="image-gallery">
            <img src="/vintage-photo.png" alt="Історичне фото" />
            <img src="/team-photo.png" alt="Команда" />
            <img src="/store-interior.png" alt="Інтер'єр магазину" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
