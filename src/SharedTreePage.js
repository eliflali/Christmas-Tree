import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "./SharedTreePage.css";

const db = getFirestore();

const compressImage = (file, maxWidth = 800) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        const newWidth = maxWidth;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to JPEG with reduced quality
        canvas.toBlob(
          (blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              const base64data = reader.result.split(',')[1];
              resolve(base64data);
            };
          },
          'image/jpeg',
          0.6  // Compression quality (0.6 = 60% quality)
        );
      };
    };
  });
};

const SharedTreePage = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const [tree, setTree] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteName, setNoteName] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showGif, setShowGif] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Validate file size before processing (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTree=()=>{
    navigate(`/register`);
  }

  const handleAddNote = async () => {
    if (!noteContent || !noteName) {
      setError("Please fill in both fields.");
      return;
    }
  
    if (isSubmitting) {
      return;
    }
  
    setIsSubmitting(true);
    setError("");
  
    try {
      let photoBase64 = null;
      if (photo) {
        try {
          photoBase64 = await compressImage(photo);
          console.log("Image compressed successfully");
        } catch (err) {
          console.error('Error compressing image:', err);
          setError("Failed to process the image. Please try a different photo.");
          setIsSubmitting(false);
          return;
        }
      }
  
      const requestData = {
        treeId,
        note: {
          content: noteContent,
          name: noteName,
        },
        photoBase64,
      };
  
      console.log("Sending request with data:", {
        ...requestData,
        photoBase64: photoBase64 ? 'base64_data_present' : null
      });
  
      const response = await fetch(
        'https://us-central1-christmas-tree-db307.cloudfunctions.net/addNote',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        }
      );
  
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Server response:', result);
        throw new Error(result.details || result.error || 'Failed to add note');
      }
  
      console.log('Success:', result);
      setSuccess("Note added successfully!");
      setNoteContent("");
      setNoteName("");
      setPhoto(null);
      setPhotoPreview(null);
      setShowGif(true);
      setTimeout(() => setShowGif(false), 3000);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || "Failed to add note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !tree) {
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
            <label htmlFor="photo-upload" className="photo-upload-button">
              📷 Add a Photo to Memory
            </label>
            {photoPreview && (
              <div className="photo-preview">
                <img src={photoPreview} alt="Preview" className="preview-image" />
              </div>
            )}
          </div>

          <button 
            onClick={handleAddNote} 
            className="add-memory-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '⏳ Adding...' : '🎄 Add Memory'}
          </button>

          <button 
            onClick={handleCreateTree} 
            className="create-tree-button"
            disabled={isSubmitting}
          >
            🎄 Create Your Own Tree
          </button>

          </div>
        )}

        {error && <p className="error-message">{error}</p>}
        {success && !showGif && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
};

export default SharedTreePage;