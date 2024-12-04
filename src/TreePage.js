import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore } from 'firebase/firestore';
import { collection, doc, getDoc, query, onSnapshot } from 'firebase/firestore';
import './TreePage.css'; // Ensure CSS is imported
import ChristmasTree from './ChristmasTree';
const db = getFirestore();

const TreePage = () => {
  const { treeId } = useParams();
  const navigate = useNavigate(); // For navigation
  const [tree, setTree] = useState(null);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [selectedNote, setSelectedNote] = useState(null);

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
    const link = `${window.location.origin}/Christmas-Tree/shared/${treeId}`;
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

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setShowCarousel(true);
    setCurrentNoteIndex(notes.findIndex(n => n.id === note.id));
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
          src={`${process.env.PUBLIC_URL}/loading.gif`}
          alt="Christmas Tree"
          className="loading-tree"
        />
      </div>
    );
  }

  // Calculate tree size based on number of notes, minimum 3 rows
  const minRows = 3;
  const notesPerRow = [1, 2, 3]; // First 3 rows fixed pattern
  let totalPositions = notesPerRow.reduce((a, b) => a + b, 0); // 6 positions for first 3 rows
  
  // Add more rows if needed based on number of notes
  if (notes.length > totalPositions) {
    const extraNotes = notes.length - totalPositions;
    const extraRows = Math.ceil(extraNotes / 4); // 4 ornaments per extra row
    for (let i = 0; i < extraRows; i++) {
      notesPerRow.push(4);
    }
    totalPositions += extraRows * 4;
  }

  const treeSize = Math.max(400, 400 + (notesPerRow.length * 30)); // Base size 400px, grows by 30px per row

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
            🎄 View All Memories
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
        <div 
          className="christmas-tree" 
          style={{ 
            height: `${treeSize}px`,
            width: `${treeSize * 0.8}px`,
            backgroundColor: 'var(--deep-green)',
            zIndex: 10,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            position: 'relative'
          }}
        >
          {notes.map((note, index) => {
            // Find which row this note belongs to
            let currentRow = 0;
            let positionInRow = index;
            let rowSum = 0;
            
            while (positionInRow >= notesPerRow[currentRow]) {
              positionInRow -= notesPerRow[currentRow];
              rowSum += notesPerRow[currentRow];
              currentRow++;
            }

            const verticalSpacing = treeSize / (notesPerRow.length + 1);
            const top = verticalSpacing * (currentRow + 1);
            
            // Calculate width at this height
            const heightRatio = top / treeSize;
            const rowWidth = (treeSize * 0.8) * (1 - (heightRatio * 0.5));
            
            // Space ornaments evenly in row
            const ornamentSpacing = rowWidth / (notesPerRow[currentRow] + 1);
            const left = ornamentSpacing * (positionInRow + 1);
            
            return (
              <div
                key={note.id}
                className="ornament"
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${left}px`,
                  transform: 'translate(-50%, -50%)', // Center the ornament at its position
                }}
                onClick={() => handleNoteClick(note)}
              >
                <div className="ornament-string"></div>
                <div className="ornament-ball">
                  <span className="ornament-name">
                    {note.name.length > 10 ? `${note.name.slice(0, 10)}...` : note.name}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="tree-trunk"></div>
        </div>
        
      </div>
      <ChristmasTree notes={notes} />

      {showCarousel && (
        <div className="memory-carousel" onClick={closeCarousel}>
          <div 
            className="carousel-content" 
            onClick={(e) => e.stopPropagation()}
          >
            {notes.length > 0 ? (
              <>
                <div className="memory-card">
                  <h3>{notes[currentNoteIndex]?.name}</h3>
                  <p>{notes[currentNoteIndex]?.content}</p>
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