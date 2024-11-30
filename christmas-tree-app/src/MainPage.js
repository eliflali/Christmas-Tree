// src/MainPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
   const navigate = useNavigate();

   return (
       <div style={{ textAlign: 'center', marginTop: '50px' }}>
           <h1>Welcome to the Christmas Tree App</h1>
           <button onClick={() => navigate('/register')}>Create My Tree</button>
           <button onClick={() => navigate('/login')} style={{ marginLeft: '10px' }}>
               Login
           </button>
       </div>
   );
};

export default MainPage;
