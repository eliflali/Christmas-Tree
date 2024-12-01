import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To redirect after registration
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { auth } from './firebase'; // Firebase Authentication instance
import { collection, doc, setDoc } from 'firebase/firestore';
import './RegisterPage.css'; // Import the CSS styles

const db = getFirestore();

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a tree for the user
      const treeId = user.uid; // Use user UID as the tree ID
      await setDoc(doc(collection(db, 'trees'), treeId), {
        userId: user.uid,
        treeName: `${name}'s Christmas Tree`,
        createdAt: new Date(),
      });

      setSuccess('Account created successfully! Share your tree link with friends!');
      navigate(`/tree/${treeId}`); // Redirect to the user's tree page
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="christmas-register-page">
      {/* Background Snowflakes */}
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
      </header>

      <div className="register-card">
        <h2 className="register-title">Sign Up</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="register-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input"
            required
          />
          <button type="submit" className="register-button">
            🎄 Register
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
};

export default RegisterPage;
