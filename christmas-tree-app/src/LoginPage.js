// src/LoginPage.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const LoginPage = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');

   const handleLogin = async (e) => {
       e.preventDefault();
       setError('');

       try {
           const userCredential = await signInWithEmailAndPassword(auth, email, password);
           const user = userCredential.user;
           console.log('Logged in as:', user);
           // Redirect to the dashboard or tree page
       } catch (err) {
           setError(err.message);
       }
   };

   return (
       <div style={{ textAlign: 'center', marginTop: '50px' }}>
           <h1>Login</h1>
           <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
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
               <button type="submit">Login</button>
           </form>
           {error && <p style={{ color: 'red' }}>{error}</p>}
       </div>
   );
};

export default LoginPage;
