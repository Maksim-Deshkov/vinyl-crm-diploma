import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Vinyls = () => {
  const [vinyls, setVinyls] = useState([]);
  const [form, setForm] = useState({ title: '', artist: '', price: '', genre: '' });

  useEffect(() => {
    loadVinyls();
  }, []);

  const loadVinyls = () => {
    axios.get('http://localhost:3001/vinyls')
      .then(res => setVinyls(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveVinyl = (e) => {
    e.preventDefault();
    if (form.id) {
      axios.put(`http://localhost:3001/vinyls/${form.id}`, form)
        .then(() => {
          loadVinyls();
          setForm({ title: '', artist: '', price: '', genre: '' });
        });
    } else {
      axios.post(`http://localhost:3001/vinyls`, form)
        .then(() => {
          loadVinyls();
          setForm({ title: '', artist: '', price: '', genre: '' });
        });
    }
  };

  const editVinyl = (vinyl) => {
    setForm(vinyl);
  };

  const deleteVinyl = (id) => {
    axios.delete(`http://localhost:3001/vinyls/${id}`)
      .then(() => loadVinyls());
  };

  return (
    <div>
      <h2>Каталог платівок</h2>

      <form onSubmit={saveVinyl}>
        <input name="title" placeholder="Назва" value={form.title} onChange={handleChange} />
        <input name="artist" placeholder="Виконавець" value={form.artist} onChange={handleChange} />
        <input name="genre" placeholder="Жанр" value={form.genre} onChange={handleChange} />
        <input name="price" type="number" placeholder="Ціна" value={form.price} onChange={handleChange} />
        <button type="submit">{form.id ? 'Оновити' : 'Додати'}</button>
      </form>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Назва</th>
            <th>Виконавець</th>
            <th>Жанр</th>
            <th>Ціна</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {vinyls.map(v => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.title}</td>
              <td>{v.artist}</td>
              <td>{v.genre}</td>
              <td>{v.price}</td>
              <td>
                <button onClick={() => editVinyl(v)}>Редагувати</button>
                <button onClick={() => deleteVinyl(v.id)}>Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Vinyls;
