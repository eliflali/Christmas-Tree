import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore } from 'firebase/firestore';
import { collection, doc, getDoc, query, onSnapshot } from 'firebase/firestore';
import { auth } from './firebase';

const db = getFirestore();

const TreePage = () => {
  const { treeId } = useParams(); // Get the treeId from the URL
  const navigate = useNavigate();

  const [tree, setTree] = useState(null);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');

  // Fetch the tree data
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

  // Copy the tree link to clipboard
  const handleCopyLink = () => {
    const link = `${window.location.origin}/tree/${treeId}`;
    navigator.clipboard.writeText(link);
    alert('Tree link copied to clipboard!');
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!tree) {
    return <p>Loading tree...</p>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>{tree.treeName}</h1>
      <img
        src="/christmas-tree.png" // Replace with a valid tree image path
        alt="Christmas Tree"
        style={{ width: '200px', height: '300px' }}
      />
      <div>
        <button onClick={() => navigate(`/tree/${treeId}/notes`)}>Show My Notes</button>
        <button onClick={handleCopyLink}>Share My Tree Link</button>
      </div>
      <h2>Notes</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <strong>{note.name}</strong>: {note.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TreePage;
