import React from 'react';

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-contacts">
        <h4>Наші контакти</h4>
        <p>Адреса: вул. Вітрука, 12, Житомир</p>
        <p>Телефон: <a href="tel:+380441121111">+380 (44) 112-11-11</a></p>
        <p>Email: <a href="mailto:info@vinyl.ua">info@vinyl.ua</a></p>
        <p className="footer-mission">
          Мета магазину: Зберігати музичну спадщину та передавати її наступним поколінням.
        </p>
      </div>
      <div className="footer-copy">
        <small>&copy; 2025 Vinyl Store. Всі права захищені.</small>
      </div>
    </div>
  </footer>
);

export default Footer;
