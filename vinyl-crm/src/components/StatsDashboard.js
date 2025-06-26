import React from 'react';

const StatsDashboard = ({ stats }) => (
  <div className="row">
    <div className="col-sm-4 mb-3">
      <div className="card text-center">
        <div className="card-body">
          <h5 className="card-title">Загальні продажі</h5>
          <p className="card-text">{stats.totalSales} грн</p>
        </div>
      </div>
    </div>
    <div className="col-sm-4 mb-3">
      <div className="card text-center">
        <div className="card-body">
          <h5 className="card-title">Кількість замовлень</h5>
          <p className="card-text">{stats.totalOrders}</p>
        </div>
      </div>
    </div>
    <div className="col-sm-4 mb-3">
      <div className="card text-center">
        <div className="card-body">
          <h5 className="card-title">Кращі платівки</h5>
          <p className="card-text">{stats.topVinylTitle}</p>
        </div>
      </div>
    </div>
  </div>
);

export default StatsDashboard;
