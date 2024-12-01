import React from 'react';
import { useLocation } from 'react-router-dom';
import './NotesPage.css'; // Add styling for this page

const NotesPage = () => {
  const location = useLocation();
  const { notes, treeName } = location.state || { notes: [], treeName: 'Tree' };

  return (
    <div className="notes-page">
        <div className="lights-container">
        <video
          className="christmas-lights-video"
          autoPlay
          loop
          muted
          playsInline
          src={`${process.env.PUBLIC_URL}/christmas_lights.mp4`}
        >
          <source src={`${process.env.PUBLIC_URL}/christmas_lights.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <header className="notes-header">
        <h1>{treeName} Memories</h1>
      </header>
      <div className="notes-container">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <h3>{note.name}</h3>
              <p>{note.content}</p>
            </div>
          ))
        ) : (
          <p>No memories added yet</p>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
