// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';
import TreePage from './TreePage';
import SharedTreePage from './SharedTreePage';

const App = () => {
   return (
       <Router>
           <Routes>
               <Route path="/" element={<MainPage />} />
               <Route path="/register" element={<RegisterPage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/tree/:treeId" element={<TreePage />} />
               <Route path="/shared/:treeId" element={<SharedTreePage />} /> {/* Shared link route */}
           </Routes>
       </Router>
   );
};

export default App;
