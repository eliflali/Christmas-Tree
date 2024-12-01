import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css'; // Import the CSS styles

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <div className="tree-container">
        <img
          src="/main_page_tree.gif"  // Ensure this path is correct
          alt="Christmas Tree"
          className="elegant-tree"
        />
      </div>

      <header className="main-header">
        <h1 className="main-title">Welcome to the Christmas Tree 🎄</h1>
        <p>Bring joy and magic to your Christmas tree!</p>
      </header>

      <div className="main-buttons">
        <button onClick={() => navigate('/register')} className="main-button">
          🎄 Create My Tree
        </button>
        <button onClick={() => navigate('/login')} className="main-button">
          🔑 Login
        </button>
      </div>
    </div>
  );
};

export default MainPage;
