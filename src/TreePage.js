import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore } from 'firebase/firestore';
import { collection, doc, getDoc, query, onSnapshot } from 'firebase/firestore';
import './TreePage.css'; // Ensure CSS is imported

const db = getFirestore();

const TreePage = () => {
  const { treeId } = useParams();
  const navigate = useNavigate(); // For navigation
  const [tree, setTree] = useState(null);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);

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

  // Fetch notes in real-time
  useEffect(() => {
    if (!treeId) return;
    const notesQuery = query(collection(db, 'trees', treeId, 'notes'));
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const fetchedNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(fetchedNotes);
    });
    return () => unsubscribe();
  }, [treeId]);

  const nextNote = () => {
    setCurrentNoteIndex((prevIndex) => (prevIndex + 1) % notes.length);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/shared/${treeId}`;  
    navigator.clipboard.writeText(link);
    alert('Tree link copied to clipboard!');
  };

  const previousNote = () => {
    setCurrentNoteIndex((prevIndex) =>
      prevIndex === 0 ? notes.length - 1 : prevIndex - 1
    );
  };

  const redirectToNotesPage = () => {
    navigate(`/tree/${treeId}/notes`, { state: { notes, treeName: tree?.treeName } });
  };

  const closeCarousel = () => {
    setShowCarousel(false);
  };

  if (error) {
    return (
      <div className="christmas-tree-page">
        <p className="error-message">Oh we are so sorry, but this tree is not available.</p>
      </div>
    );
  }

  /*<div className="tree-container">
        <div className="notes-on-tree">
          {notes.map((note, index) => (
            <div
              key={note.id}
              className="note-card-on-tree"
              style={{
                top: `${index * 12 + 10}%`, // Adjust vertical position
                left: `${50 + Math.sin(index) * 30}%`, // Distribute horizontally
              }}
            >
              <h3>{note.name.length > 15 ? `${note.name.slice(0, 7)}...` : note.name}</h3>
              <div className="hanger"></div>
            </div>
          ))}
        </div>
        <img
          src={`${process.env.PUBLIC_URL}/christmas_tree.webp`} // Ensure this path is correct
          alt="Christmas Tree"
          className="elegant-tree"
          onClick={() => redirectToNotesPage()}
        />
      </div> */

  if(!tree) {
    return (
    <div className="loading-container">
      <img
        src={`${process.env.PUBLIC_URL}/loading.gif`} // Ensure this path is correct
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
          src={`${process.env.PUBLIC_URL}/christmas_lights.mp4`}
        >
          <source src={`${process.env.PUBLIC_URL}/christmas_lights.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <header className="christmas-header">
        <h1 className="tree-title">
          {error || (!tree ? 'Christmas Memory Tree' : tree.treeName)}
        </h1>
        <div className="tree-actions">
          <button 
            className="christmas-button" 
            onClick={() => setShowCarousel(true)}
          >
            🎄 View Memories
          </button>
          <button 
            className="christmas-button" 
            onClick={handleCopyLink}
          >
            🔗 Share Tree
          </button>
        </div>
      </header>
      
      <div className="tree-container">
        
        <img
          src={`${process.env.PUBLIC_URL}/christmas_tree.webp`} // Ensure this path is correct
          alt="Christmas Tree"
          className="elegant-tree"
          onClick={() => redirectToNotesPage()}
        />
      </div>
      {showCarousel && (
  <div className="memory-carousel" onClick={closeCarousel}>
    <div 
      className="carousel-content" 
      onClick={(e) => e.stopPropagation()}
    >
      {notes.length > 0 ? (
        <>
          <div 
            className="memory-card"
            style={{
              backgroundImage: notes[currentNoteIndex]?.photoBase64 
                ? `url(data:image/jpeg;base64,${notes[currentNoteIndex].photoBase64})`
                : 'none'
            }}
          >
            <div className="memory-content">
              <h3>{notes[currentNoteIndex]?.name}</h3>
              <p>{notes[currentNoteIndex]?.content}</p>
            </div>
          </div>
          <div className="carousel-navigation">
            <button onClick={previousNote}>◀ Previous</button>
            <button onClick={nextNote}>Next ▶</button>
          </div>
        </>
      ) : (
        <p>No memories added yet</p>
      )}
    </div>
  </div>
)}
    </div>
  );
};

export default TreePage;