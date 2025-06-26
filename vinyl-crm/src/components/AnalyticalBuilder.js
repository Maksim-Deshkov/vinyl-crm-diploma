import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

const DATA_SOURCES = [
  { label: 'Замовлення', value: 'orders' },
  { label: 'Платівки',   value: 'vinyls' },
  { label: 'Користувачі', value: 'users' }
];

const CHART_TYPES = [
  { label: 'Стовпчиковий', value: 'bar' },
  { label: 'Кругова діаграма', value: 'pie' },
  { label: 'Лінійний', value: 'line' }
];

const AnalyticalBuilder = () => {
  const [rawData, setRawData] = useState({ orders: [], vinyls: [], users: [] });
  const [config, setConfig] = useState({
    source: 'orders',
    metric: '',
    groupBy: '',
    chartType: 'bar'
  });
  const [chartData, setChartData] = useState([]);

  // 1) Load all datasets once
  useEffect(() => {
    Promise.all([
      api.get('/orders/with-vinyls'),
      api.get('/vinyls'),
      api.get('/users')
    ]).then(([o, v, u]) => {
      setRawData({ orders: o.data, vinyls: v.data, users: u.data });
    }).catch(console.error);
  }, []);

  // 2) Re-generate chartData whenever config or rawData changes
  useEffect(() => {
    const ds = rawData[config.source] || [];
    // simple grouping & counting example
    const map = {};
    ds.forEach(item => {
      const key = config.groupBy
        ? (item[config.groupBy] ?? '—')
        : 'all';
      const value = config.metric
        ? Number(item[config.metric]) || 0
        : 1;
      map[key] = (map[key] || 0) + value;
    });
    setChartData(Object.entries(map).map(([name, value]) => ({ name, value })));
  }, [config, rawData]);

  return (
    <div className="analytic-builder">
      <aside className="builder-controls">
        <h3>Аналітичний конструктор</h3>

        <label>Джерело даних</label>
        <select
          value={config.source}
          onChange={e => setConfig(c => ({ ...c, source: e.target.value }))}
        >
          {DATA_SOURCES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <label>Метрика (numeric field)</label>
        <select
          value={config.metric}
          onChange={e => setConfig(c => ({ ...c, metric: e.target.value }))}
        >
          <option value="">Кількість записів</option>
          {config.source === 'orders' && (
            <>
              <option value="payment.amount">Сума оплати</option>
            </>
          )}
          {config.source === 'vinyls' && (
            <>
              <option value="price">Ціна</option>
            </>
          )}
          {/* users може не мати числових полів */}
        </select>

        <label>Групувати за</label>
        <select
          value={config.groupBy}
          onChange={e => setConfig(c => ({ ...c, groupBy: e.target.value }))}
        >
          <option value="">— без групування —</option>
          {config.source === 'orders' && (
            <>
              <option value="status">Статус</option>
              <option value="userId">Клієнт</option>
            </>
          )}
          {config.source === 'vinyls' && (
            <option value="genre">Жанр</option>
          )}
          {config.source === 'users' && (
            <option value="role">Роль</option>
          )}
        </select>

        <label>Тип графіка</label>
        <select
          value={config.chartType}
          onChange={e => setConfig(c => ({ ...c, chartType: e.target.value }))}
        >
          {CHART_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </aside>

      <main className="builder-preview">
        <h4>Дані для графіка</h4>
        {chartData.length === 0 ? (
          <p>Немає даних</p>
        ) : config.chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>

        ) : config.chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>

        ) : config.chartType === 'line' ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={COLORS[1]} />
            </LineChart>
          </ResponsiveContainer>
        ) : null }
      </main>
    </div>
  );
};

export default AnalyticalBuilder;
