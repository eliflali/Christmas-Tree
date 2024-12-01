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
    } catch (err) {
      console.error(err);
      setError('Failed to add note.');
    }
  };

  // Snowflake generation function
  const generateSnowflakes = () => {
    return [...Array(20)].map((_, i) => (
      <div 
        key={i} 
        className="snowflake" 
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          fontSize: `${Math.random() * 1.5 + 0.5}rem`
        }}
      >
        ❄️
      </div>
    ));
  };

  

  if (error) {
    return (
      <div className="christmas-tree-page">
        <p className="error-message">Oh we are so sorry, but this tree is not available.</p>
      </div>
    );
  }

  if(!tree) {
    return (
    <div className="loading-container">
      <img
        src="/loading.gif"  // Ensure this path is correct
        alt="Christmas Tree"
        className="loading-tree"
      />
    </div>);
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
          src='/christmas_lights.mp4'
        >
          <source src="christmas_lights.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      
      <header className="christmas-header">
        <h1 className="tree-title">{tree.treeName || 'Shared Christmas Tree'}</h1>
      </header>
        {/* Add the video for flickering lights */}
      
      <div className="add-note-container">
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
          
          <button 
            onClick={handleAddNote} 
            className="christmas-button"
          >
            🎄 Add Memory
          </button>

          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SharedTreePage;