// src/RegisterPage.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const RegisterPage = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [name, setName] = useState('');
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');

   const handleRegister = async (e) => {
       e.preventDefault();
       setError('');
       setSuccess('');

       try {
           const userCredential = await createUserWithEmailAndPassword(auth, email, password);
           const user = userCredential.user;
           console.log('User created:', user);

           // Optional: Store additional user details in Firestore here
           setSuccess('Account created successfully!');
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
