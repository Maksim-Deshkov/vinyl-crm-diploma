import React from 'react';

const HitCarousel = ({ products }) => {
  return (
    <div className="hit-carousel">
      <h2>Хіти продажу</h2>
      <div className="carousel-track">
        {products.map(product => (
          <div className="carousel-item" key={product._id}>
            <img
              src={`http://localhost:3001${product.cover}`}
              alt={product.title}
              className="carousel-img"
            />
            <div className="carousel-title">{product.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HitCarousel;
