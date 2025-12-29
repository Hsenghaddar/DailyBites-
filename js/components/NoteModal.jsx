import React, { useState, useRef } from 'react';

export const NoteModal = ({ day, initialNote, onSave, onClose }) => {
  const [noteText, setNoteText] = useState(typeof initialNote === 'string' ? initialNote : '');
  const modalRef = useRef(null);

  const handleSave = async () => {
    const note = noteText.trim();
    if (!note) {
      await appConfirm('Please write something!', true);
      return;
    }
    onSave(note);
  };

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  return (
    <div className="note-modal" ref={modalRef} onClick={handleBackdropClick}>
      <div className="note-box">
        <div className="note-header">
          <h3>Add Note for {day}</h3>
          <i className="bi bi-x-lg close-note" onClick={onClose}></i>
        </div>
        <textarea
          placeholder="Write your note here..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          autoFocus
        />
        <button className="save-note" onClick={handleSave}>
          Save Note
        </button>
      </div>
    </div>
  );
};
