import React, { useState, useEffect } from "react";
import "./App.css";

/** 
 * NOTES FRONTEND APP
 * Features: List/Create/Edit/Delete/View notes (local state).
 * Minimalistic sidebar layout, light theme, custom color palette.
 * Structure allows for future .env/backend usage but no actual backend connectivity.
 */

// ----- Note type -----
function uuidv4() {
  // Simple UUID for local new notes
  // PUBLIC_INTERFACE
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// PUBLIC_INTERFACE
const DEFAULT_NOTES = [
  {
    id: uuidv4(),
    title: "Welcome to Note Keeper",
    body: "This is a sample note. Select, edit, or add a new note using the sidebar.",
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  },
];

// PUBLIC_INTERFACE
function Sidebar({ notes, selectedId, onSelect, onCreate, onDelete }) {
  /** Sidebar for notes list + new note FAB and delete buttons */
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Notes</h1>
        <button className="fab" title="Create new note" onClick={onCreate}>
          +
        </button>
      </div>
      <ul className="note-list">
        {notes.map((note) => (
          <li
            key={note.id}
            className={selectedId === note.id ? "selected" : ""}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-title">{note.title || "(Untitled)"}</span>
            <button
              className="del-btn"
              title="Delete note"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              🗑
            </button>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="no-notes">(No notes)</li>
        )}
      </ul>
    </aside>
  );
}

// PUBLIC_INTERFACE
function NoteDetail({ note, onEdit, onSave, onCancel, isEditing }) {
  /** Main panel: View or Edit a note */
  const [editNote, setEditNote] = useState(note);

  useEffect(() => {
    setEditNote(note);
  }, [note]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditNote({ ...editNote, [name]: value, lastUpdated: new Date().toISOString() });
  };

  if (!note) {
    return (
      <div className="note-detail empty">
        <p>Select a note or create a new one.</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="note-detail">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(editNote);
          }}
        >
          <input
            className="note-title-input"
            name="title"
            value={editNote.title}
            placeholder="Title"
            onChange={handleChange}
            autoFocus
            maxLength={80}
          />
          <textarea
            className="note-body-input"
            name="body"
            placeholder="Your note..."
            value={editNote.body}
            onChange={handleChange}
            rows={10}
            maxLength={2000}
          />
          <div className="note-buttons">
            <button className="btn-primary" type="submit">Save</button>
            <button className="btn-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // View mode
  return (
    <div className="note-detail">
      <div>
        <h2>{note.title || "(Untitled)"}</h2>
        <div className="note-meta">
          <span>Created: {new Date(note.created).toLocaleString()}</span>
          <span>Last updated: {new Date(note.lastUpdated).toLocaleString()}</span>
        </div>
      </div>
      <hr />
      <div className="note-body">{note.body || <i>(empty)</i>}</div>
      <div className="note-buttons view">
        <button className="btn-primary" onClick={onEdit}>Edit</button>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // All note data in local state (replace with API/database in the future)
  const [notes, setNotes] = useState([...DEFAULT_NOTES]);
  const [selectedId, setSelectedId] = useState(notes.length > 0 ? notes[0].id : null);
  const [editing, setEditing] = useState(false);

  // If selected note is deleted or notes empty, select another
  useEffect(() => {
    if (!notes.find(n => n.id === selectedId)) {
      setSelectedId(notes.length > 0 ? notes[0].id : null);
      setEditing(false);
    }
  }, [notes, selectedId]);

  // PUBLIC_INTERFACE
  const handleSelectNote = (id) => {
    setSelectedId(id);
    setEditing(false);
  };

  // PUBLIC_INTERFACE
  const handleCreateNote = () => {
    const newNote = {
      id: uuidv4(),
      title: "",
      body: "",
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setSelectedId(newNote.id);
    setEditing(true);
  };

  // PUBLIC_INTERFACE
  const handleDeleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    if (selectedId === id) setEditing(false);
  };

  // PUBLIC_INTERFACE
  const handleEditNote = () => setEditing(true);

  // PUBLIC_INTERFACE
  const handleSaveNote = (editedNote) => {
    setNotes(notes.map(n => (n.id === editedNote.id ? editedNote : n)));
    setEditing(false);
  };

  // PUBLIC_INTERFACE
  const handleCancelEdit = () => setEditing(false);

  // Future: Allow configuration from .env API_BASE_URL, etc.
  // (Code structure keeps all CRUD logic in central App component for easy backend swap.)

  const selectedNote = notes.find(n => n.id === selectedId);

  return (
    <div className="note-app-container">
      <Sidebar
        notes={notes}
        selectedId={selectedId}
        onSelect={handleSelectNote}
        onCreate={handleCreateNote}
        onDelete={handleDeleteNote}
      />
      <main className="main-panel">
        <NoteDetail
          note={selectedNote}
          isEditing={editing}
          onEdit={handleEditNote}
          onSave={handleSaveNote}
          onCancel={handleCancelEdit}
        />
      </main>
    </div>
  );
}

export default App;
