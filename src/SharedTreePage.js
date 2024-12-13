import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import "./SharedTreePage.css";

const db = getFirestore();
const functions = getFunctions();

const SharedTreePage = () => {
  const { treeId } = useParams();
  const [tree, setTree] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteName, setNoteName] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showGif, setShowGif] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const treeDoc = await getDoc(doc(db, "trees", treeId));
        if (treeDoc.exists()) {
          setTree(treeDoc.data());
        } else {
          setError("Tree not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch tree data");
      }
    };
    fetchTree();
  }, [treeId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertPhotoToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // Remove the data URL prefix
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAddNote = async () => {
    if (!noteContent || !noteName) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      let photoBase64 = null;
      if (photo) {
        photoBase64 = await convertPhotoToBase64(photo);
      }

      const addNoteFunc = httpsCallable(functions, "addNote");
      const result = await addNoteFunc({
        treeId,
        note: {
          content: noteContent,
          name: noteName,
        },
        //photoBase64,
      });

      console.log(result.data.message);
      setSuccess("Note added successfully!");
      setNoteContent("");
      setNoteName("");
      setPhoto(null);
      setPhotoPreview(null);
      setShowGif(true);
      setTimeout(() => setShowGif(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to add note.");
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
          src={`${process.env.PUBLIC_URL}/loading.gif`}
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
        <h1 className="tree-title">{tree.treeName || "Shared Christmas Tree"}</h1>
      </header>

      <div className="add-note-container">
        {showGif ? (
          <div className="gif-container">
            <img
              src={`${process.env.PUBLIC_URL}/tree_monster.gif`}
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
            <div className="photo-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="photo-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="christmas-button">
                📷 Add a Photo
              </label>
              {photoPreview && (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" className="preview-image" />
                </div>
              )}
            </div>
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
