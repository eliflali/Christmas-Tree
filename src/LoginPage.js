import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To handle redirection
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import './LoginPage.css'; // Import the CSS styles

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Redirect to the user's tree page
      navigate(`/tree/${user.uid}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="christmas-login-page">
      {/* Background Snowflakes */}
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
        <h1 className="page-title">Welcome Back</h1>
        <p>Your tree misses you.</p>
      </header>

      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
          <button type="submit" className="login-button">
            🎄 Login
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
