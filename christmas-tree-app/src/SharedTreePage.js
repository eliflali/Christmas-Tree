import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import './SharedTreePage.css';

const db = getFirestore();

const SharedTreePage = () => {
  const { treeId } = useParams();
  const [tree, setTree] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteName, setNoteName] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showGif, setShowGif] = useState(false); // State to show GIF

  // Fetch tree data
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const treeDoc = await getDoc(doc(db, 'trees', treeId));
        if (treeDoc.exists()) {
          setTree(treeDoc.data());
        } else {
          setError('Tree not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch tree data');
      }
    };
    fetchTree();
  }, [treeId]);

  const handleAddNote = async () => {
    if (!noteContent || !noteName) {
      setError('Please fill in both fields.');
      return;
    }
    try {
      await addDoc(collection(db, 'trees', treeId, 'notes'), {
        content: noteContent,
        name: noteName,
        createdAt: new Date(),
      });
      setSuccess('Note added successfully!');
      setNoteContent('');
      setNoteName('');
      setShowGif(true); // Show the GIF
      setTimeout(() => setShowGif(false), 3000); // Hide GIF after 3 seconds
    } catch (err) {
      console.error(err);
      setError('Failed to add note.');
    }
  };

  if (error) {
    return (
      <div className="christmas-tree-page">
        <p className="error-message">Oh we are so sorry, but this tree is not available.</p>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="loading-container">
        <img
          src={`${process.env.PUBLIC_URL}/loading.gif`} // Ensure this path is correct
          alt="Christmas Tree"
          className="loading-tree"
        />
      </div>
    );
  }

  return (
    <div className="christmas-tree-page">
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

      <header className="christmas-header">
        <h1 className="tree-title">{tree.treeName || 'Shared Christmas Tree'}</h1>
      </header>

      <div className="add-note-container">
        {showGif ? (
          <div className="gif-container">
            <img
              src={`${process.env.PUBLIC_URL}/tree_monster.gif`} // Path to your GIF
              alt="Tree Monster"
              className="tree-monster-gif"
            />
            <p className="success-message">
              You have added a memory to <strong>{tree.treeName}</strong>!
            </p>
          </div>
        ) : (
          <div className="memory-card">
            <h2 className="add-note-title">Leave a Memory</h2>
            <input
              type="text"
              placeholder="Your Name"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              className="note-input"
            />
            <textarea
              placeholder="Write your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="note-textarea"
            />
            <button onClick={handleAddNote} className="christmas-button">
              🎄 Add Memory
            </button>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default SharedTreePage;
