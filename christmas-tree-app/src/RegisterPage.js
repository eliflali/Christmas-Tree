import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To redirect after registration
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { auth } from './firebase'; // Firebase Authentication instance
import { collection, doc, setDoc } from 'firebase/firestore';

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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Register</h1>
      <form onSubmit={handleRegister} style={{ display: 'inline-block', textAlign: 'left' }}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default RegisterPage;
