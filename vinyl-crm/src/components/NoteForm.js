import React, { useState } from 'react';

const NoteForm = ({ onAddNote }) => {
  const [text, setText] = useState('');

  const submit = e => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddNote(text.trim());
    setText('');
  };

  return (
    <form onSubmit={submit} className="d-flex gap-2">
      <textarea
        className="form-control"
        rows="3"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Нотатка"
      />
      <button type="submit" className="btn btn-primary">Додати</button>
    </form>
  );
};

export default NoteForm;
