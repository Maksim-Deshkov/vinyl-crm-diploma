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
  { label: 'Платівки', value: 'vinyls' },
  { label: 'Користувачі', value: 'users' }
];
const CHART_TYPES = [
  { label: 'Стовпчиковий', value: 'bar' },
  { label: 'Кругова діаграма', value: 'pie' },
  { label: 'Лінійний', value: 'line' }
];

const ALL_STATUSES = ['НОВЕ', 'В ОБРОБЦІ', 'ВІДПРАВЛЕНО', 'ВИКОНАНО', 'ВІДХИЛЕНО'];

function median(values) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? ((s[mid - 1] + s[mid]) / 2).toFixed(2) : s[mid].toFixed(2);
}

// Генерує ключ-місяць для агрегації (YYYY-MM)
function getMonthKey(date) {
  const d = new Date(date);
  if (isNaN(d)) return 'невідомо';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Динаміка продажів та замовлень по місяцях
function getMonthlyStats(orders, type = 'amount') {
  const map = {};
  orders.forEach(o => {
    if (!o.statusLog || !o.statusLog.length) return;
    const d = o.statusLog.slice(-1)[0].date;
    const month = getMonthKey(d);
    if (!map[month]) map[month] = { name: month, amount: 0, count: 0 };
    if (type === 'amount') map[month].amount += (o.payment?.amount || 0);
    map[month].count += 1;
  });
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
}

// Динаміка нових користувачів по місяцях
function getUserMonthlyStats(users) {
  const map = {};
  users.forEach(u => {
    if (!u.createdAt) return;
    const month = getMonthKey(u.createdAt);
    if (!map[month]) map[month] = { name: month, count: 0 };
    map[month].count += 1;
  });
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
}

const Dashboard = () => {
  const [orderStats, setOrderStats] = useState({});
  const [salesStats, setSalesStats] = useState({});
  const [vinylSalesStats, setVinylSalesStats] = useState({});
  const [clientStats, setClientStats] = useState({});
  const [vinylCatalogStats, setVinylCatalogStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [rawData, setRawData] = useState({ orders: [], vinyls: [], users: [] });
  const [analytics, setAnalytics] = useState([{
    id: Date.now(),
    source: 'orders', metric: '', groupBy: '', chartType: 'bar',
    startDate: '', endDate: ''
  }]);

  useEffect(() => {
    Promise.all([
      api.get('/orders/with-vinyls'),
      api.get('/vinyls'),
      api.get('/users')
    ])
      .then(([o, v, u]) => {
        setRawData({ orders: o.data, vinyls: v.data, users: u.data });
        buildDefault(o.data, v.data, u.data);
      })
      .catch(console.error);
  }, []);

  function buildDefault(orders, vinyls, users) {
    const valid = orders.filter(o => (o.status || '').toUpperCase() !== 'ВІДХИЛЕНО');
    const totalOrders = orders.length;

    const ordersByStatus = {};
    ALL_STATUSES.forEach(st => ordersByStatus[st] = 0);

    orders.forEach(o => {
      const st = (o.status || '').toUpperCase();
      if (ALL_STATUSES.includes(st)) {
        ordersByStatus[st]++;
      }
    });

    const totalSales = valid.reduce((s, o) => s + (o.payment?.amount || 0), 0);
    const avgOrderValue = valid.length ? (totalSales / valid.length).toFixed(2) : 0;
    const medianOrderValue = median(valid.map(o => o.payment?.amount || 0));

    const countMap = {};
    valid.forEach(o => o.vinylInfos.forEach(v => {
      const key = `${v.title} — ${v.artist}`;
      countMap[key] = (countMap[key] || 0) + v.count;
    }));
    const topVinyls = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const vinylChart = topVinyls.map(([name, quantity]) => ({ name, quantity }));

    const clientMap = {};
    valid.forEach(o => {
      const uid = o.userId, name = o.userInfo?.name || '—';
      if (!clientMap[uid]) clientMap[uid] = { userId: uid, name, total: 0, orders: 0 };
      clientMap[uid].total += (o.payment?.amount || 0);
      clientMap[uid].orders += 1;
    });
    const topClients = Object.values(clientMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    const byGenre = vinyls.reduce((a, v) => {
      const g = v.genre || '—';
      a[g] = (a[g] || 0) + 1;
      return a;
    }, {});
    const totalVinyls = vinyls.length;

    // Додатково: користувачі по ролях, та "нові" за останній місяць (якщо є createdAt)
    const rolesMap = {};
    users.forEach(u => {
      const r = u.role || 'user';
      rolesMap[r] = (rolesMap[r] || 0) + 1;
    });

    const lastMonth = (() => {
      const now = new Date();
      return users.filter(u => {
        const d = u.createdAt ? new Date(u.createdAt) : null;
        return d && d > new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }).length;
    })();

    setOrderStats({ totalOrders, ordersByStatus, avgOrderValue, medianOrderValue });
    setSalesStats({ totalSales });
    setVinylSalesStats({ topVinyls, vinylChart });
    setClientStats({ topClients });
    setVinylCatalogStats({ totalVinyls, byGenre });
    setUserStats({ rolesMap, lastMonth });
  }

  const addPanel = () => setAnalytics(a => [
    ...a,
    { id: Date.now(), source: 'orders', metric: '', groupBy: '', chartType: 'bar', startDate: '', endDate: '' }
  ]);
  const removePanel = id => setAnalytics(a => a.filter(p => p.id !== id));
  const updatePanel = (id, field, value) =>
    setAnalytics(a => a.map(p => p.id === id ? { ...p, [field]: value } : p));

  // === ОНОВЛЕНА логіка makeData (універсальна) ===
  const makeData = (p) => {
    let data = rawData[p.source] || [];

    // --- Фільтр по даті ---
    if ((p.source === 'orders' || p.source === 'users' || p.source === 'vinyls') && p.startDate && p.endDate) {
      data = data.filter(item => {
        let d = null;
        if (p.source === 'orders') {
          d = new Date(item.statusLog?.slice(-1)[0]?.date);
        } else if (item.createdAt) {
          d = new Date(item.createdAt);
        }
        return d && d >= new Date(p.startDate) && d <= new Date(p.endDate);
      });
    }

    // --- Агрегація ---
    const map = {};
    data.forEach(item => {
      // Групування
      let key = 'Всі';
      if (p.groupBy) {
        if (p.groupBy === 'month' && p.source === 'orders') {
          key = getMonthKey(item.statusLog?.slice(-1)[0]?.date || new Date());
        } else if (p.source === 'orders' && p.groupBy === 'userId' && item.userInfo) {
          key = item.userInfo.name || item.userId || '—';
        } else {
          key = item[p.groupBy] || '—';
        }
      }
      // Метрика
      let val = 1;
      if (p.metric) {
        if (p.metric === 'average' && p.source === 'orders') {
          // Тут буде розрахунок середнього чеку — зробимо після заповнення map
        } else {
          val = (p.metric.split('.').reduce((o, f) => o?.[f], item) || 0);
        }
      }
      map[key] = (map[key] || 0) + Number(val);
    });

    // Середній чек — особливий випадок
    if (p.metric === 'average' && p.source === 'orders') {
      // Групуємо масиви сум для кожної групи, потім рахуємо середнє
      const arrMap = {};
      data.forEach(item => {
        let key = 'Всі';
        if (p.groupBy) {
          if (p.groupBy === 'month' && p.source === 'orders') {
            key = getMonthKey(item.statusLog?.slice(-1)[0]?.date || new Date());
          } else if (p.groupBy === 'userId' && item.userInfo) {
            key = item.userInfo.name || item.userId || '—';
          } else {
            key = item[p.groupBy] || '—';
          }
        }
        const val = item.payment?.amount || 0;
        if (!arrMap[key]) arrMap[key] = [];
        arrMap[key].push(val);
      });
      return Object.entries(arrMap).map(([name, arr]) => ({
        name,
        value: arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(2) : 0
      }));
    }

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="dashboard">
      <h2>CRM Дашборд</h2>

      <div className="dashboard-grid">
        <div className="card">
          <h3>📊 Продажі</h3>
          <p>Загальна сума: <strong>{salesStats.totalSales} грн</strong></p>
          <p>Середній чек: <strong>{orderStats.avgOrderValue} грн</strong></p>
          <p>Медіанний чек: <strong>{orderStats.medianOrderValue} грн</strong></p>
        </div>

        <div className="card">
          <h3>📝 Замовлення</h3>
          <p>Усього: <strong>{orderStats.totalOrders}</strong></p>
          <ul>
            {ALL_STATUSES.map(st => (
              <li key={st}>{st}: {orderStats.ordersByStatus?.[st] || 0}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>🔥 Топ-5 платівок</h3>
          <ul>
            {vinylSalesStats.topVinyls?.map(([name, qty]) => (
              <li key={name}>{name}: {qty} шт.</li>
            ))}
          </ul>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={vinylSalesStats.vinylChart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>🏆 Топ-20 клієнтів</h3>
          <ul>
            {clientStats.topClients?.map(c => (
              <li key={c.userId}>
                {c.name}: {c.total} грн ({c.orders})
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>📚 Каталог платівок</h3>
          <p>Усього у каталозі: <strong>{vinylCatalogStats.totalVinyls}</strong></p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={Object.entries(vinylCatalogStats.byGenre || {}).map(([name, v]) => ({ name, value: v }))}
                  dataKey="value" nameKey="name" outerRadius={60} label
                >
                  {Object.keys(vinylCatalogStats.byGenre || {}).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Динаміка продажів по місяцях */}
        <div className="card">
          <h3>📈 Динаміка продажів (місяці)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={getMonthlyStats(rawData.orders, 'amount')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke={COLORS[1]} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Динаміка замовлень по місяцях */}
        <div className="card">
          <h3>📉 Динаміка замовлень (місяці)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={getMonthlyStats(rawData.orders, 'count')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Динаміка нових користувачів */}
        <div className="card">
          <h3>🆕 Нові користувачі (місяці)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={getUserMonthlyStats(rawData.users)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke={COLORS[2]} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
  
      </div>

      {/* === Аналітичний конструктор === */}
      <div className="dashboard-analytics">
        <div className="analytics-header">
          <h3>Аналітичний конструктор</h3>
          <button className="add-analytics" onClick={addPanel}>＋</button>
        </div>
        <div className="analytics-grid">
          {analytics.map(p => {
            const data = makeData(p);
            return (
              <div key={p.id} className="analytics-panel card">
                <div className="panel-header">
                  <strong>Аналітика</strong>
                  <button className="remove-analytics" onClick={() => removePanel(p.id)}>✕</button>
                </div>
                <div className="panel-controls">
                  <select value={p.source} onChange={e => updatePanel(p.id, 'source', e.target.value)}>
                    {DATA_SOURCES.map(ds => (
                      <option key={ds.value} value={ds.value}>{ds.label}</option>
                    ))}
                  </select>
                  <select value={p.metric} onChange={e => updatePanel(p.id, 'metric', e.target.value)}>
                    <option value="">Кількість записів</option>
                    {p.source === 'orders' && <option value="payment.amount">Сума оплати</option>}
                    {p.source === 'orders' && <option value="average">Середній чек</option>}
                    {p.source === 'vinyls' && <option value="price">Ціна</option>}
                  </select>
                  <select value={p.groupBy} onChange={e => updatePanel(p.id, 'groupBy', e.target.value)}>
                    <option value="">— без групування —</option>
                    {p.source === 'orders' && <>
                      <option value="status">Статус</option>
                      <option value="userId">Клієнт</option>
                      <option value="month">Місяць</option>
                    </>}
                    {p.source === 'vinyls' && <option value="genre">Жанр</option>}
                    {p.source === 'users' && <option value="role">Роль</option>}
                  </select>
                  <select value={p.chartType} onChange={e => updatePanel(p.id, 'chartType', e.target.value)}>
                    {CHART_TYPES.map(ct => (
                      <option key={ct.value} value={ct.value}>{ct.label}</option>
                    ))}
                  </select>
                  <div className="date-range">
                    <input type="date" value={p.startDate} onChange={e => updatePanel(p.id, 'startDate', e.target.value)} />
                    <span>—</span>
                    <input type="date" value={p.endDate} onChange={e => updatePanel(p.id, 'endDate', e.target.value)} />
                  </div>
                </div>
                <div className="chart-wrapper">
                  {data.length === 0 ? (
                    <div className="dashboard-empty">Даних для побудови аналітики не знайдено</div>
                  ) : p.chartType === 'bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill={COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : p.chartType === 'pie' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" outerRadius={60} label>
                          {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke={COLORS[1]} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
