import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [vinylStats, setVinylStats] = useState({});
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/orders')
      .then(res => {
        setOrders(res.data);
        calculateStats(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const calculateStats = (orders) => {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    const vinylCount = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        vinylCount[item.title] = (vinylCount[item.title] || 0) + item.quantity;
      });
    });

    const dataForChart = Object.entries(vinylCount).map(([title, qty]) => ({
      name: title,
      quantity: qty
    }));

    setVinylStats({
      totalSales,
      totalOrders,
      topVinyls: Object.entries(vinylCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    });

    setChartData(dataForChart);
  };

  return (
    <div>
      <h2>CRM Дашборд</h2>
      <p><strong>Загальна сума продажів:</strong> {vinylStats.totalSales || 0} грн</p>
      <p><strong>Кількість замовлень:</strong> {vinylStats.totalOrders || 0}</p>
      
      <h3>Топ-продані платівки</h3>
      {vinylStats.topVinyls && vinylStats.topVinyls.length > 0 ? (
        <ul>
          {vinylStats.topVinyls.map(([title, qty]) => (
            <li key={title}>{title} — {qty} шт.</li>
          ))}
        </ul>
      ) : (
        <p>Немає даних.</p>
      )}

      <h3>Графік продажів за платівками</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="quantity" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard;
