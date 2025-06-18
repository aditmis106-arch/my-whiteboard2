import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './index.min.css';
import { useNavigate } from 'react-router-dom';
import boardContext from '../../store/board-context';
import { useParams } from 'react-router-dom';

const Sidebar = () => {
  const [canvases, setCanvases] = useState([]);
  const [sharedCanvases, setSharedCanvases] = useState([]);
  const token = localStorage.getItem('whiteboard_user_token');
  const { canvasId, setCanvasId, setElements, setHistory, isUserLoggedIn, setUserLoginStatus } = useContext(boardContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('my-canvases');

  const { id } = useParams(); 

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchCanvases();
      fetchSharedCanvases();
    }
  }, [isUserLoggedIn]);

  const fetchCanvases = async () => {
    try {
      const response = await axios.get('https://api-whiteboard-az.onrender.com/api/canvas/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanvases(response.data);
      console.log('My canvases:', response.data);
      
      if (response.data.length === 0) {
        const newCanvas = await handleCreateCanvas();
        if (newCanvas) {
          setCanvasId(newCanvas._id);
          handleCanvasClick(newCanvas._id);
        }
      } else if (!canvasId && response.data.length > 0) {
        if(!id){
          setCanvasId(response.data[0]._id);
          handleCanvasClick(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching canvases:', error);
    }
  };

  const fetchSharedCanvases = async () => {
    try {
      const response = await axios.get('https://api-whiteboard-az.onrender.com/api/canvas/shared', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSharedCanvases(response.data);
      console.log('Shared canvases:', response.data);
    } catch (error) {
      console.error('Error fetching shared canvases:', error);
    }
  };

  const handleCreateCanvas = async () => {
    try {
      const response = await axios.post('https://api-whiteboard-az.onrender.com/api/canvas/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data);
      fetchCanvases();
      setCanvasId(response.data.canvasId);
      handleCanvasClick(response.data.canvasId);
      return response.data;
    } catch (error) {
      console.error('Error creating canvas:', error);
      return null;
    }
  };

  const handleDeleteCanvas = async (id) => {
    try {
      await axios.delete(`https://api-whiteboard-az.onrender.com/api/canvas/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCanvases();
      if (canvases.length > 1) {
        const remainingCanvas = canvases.find(canvas => canvas._id !== id);
        if (remainingCanvas) {
          setCanvasId(remainingCanvas._id);
          handleCanvasClick(remainingCanvas._id);
        }
      }
    } catch (error) {
      console.error('Error deleting canvas:', error);
    }
  };

  const handleCanvasClick = async (id) => {
    navigate(`/whiteboard/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('whiteboard_user_token');
    setCanvases([]);
    setSharedCanvases([]);
    setUserLoginStatus(false);
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleShare = async () => {
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!canvasId) {
      setError("No canvas selected to share.");
      return;
    }

    try {
      setIsSharing(true);
      setError("");
      setSuccess("");

      const response = await axios.post(
        `https://api-whiteboard-az.onrender.com/api/canvas/share`,
        { 
          canvasId: canvasId,
          email: email.trim() 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setSuccess(`Canvas shared successfully with ${email.trim()}!`);
        setEmail("");
        
        setTimeout(() => {
          setSuccess("");
        }, 5000);
      }
    } catch (err) {
      console.error('Share error:', err);
      if (err.response?.status === 404) {
        setError("User with this email not found. They need to register first.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid request. Please try again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to share this canvas.");
      } else {
        setError(err.response?.data?.message || "Failed to share canvas. Please try again.");
      }
      
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setIsSharing(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="back-home-btn" onClick={handleBackToHome}>
          ← Home
        </button>
      </div>
      
      <button 
        className="create-button" 
        onClick={handleCreateCanvas} 
        disabled={!isUserLoggedIn}
      >
        + Create New Canvas
      </button>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'my-canvases' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-canvases')}
        >
          My Canvases ({canvases.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          Shared ({sharedCanvases.length})
        </button>
      </div>
      
      {/* Canvas Lists */}
      {activeTab === 'my-canvases' && (
        <ul className="canvas-list">
          {canvases.map(canvas => (
            <li 
              key={canvas._id} 
              className={`canvas-item ${canvas._id === canvasId ? 'selected' : ''}`}
            >
              <span 
                className="canvas-name" 
                onClick={() => handleCanvasClick(canvas._id)}
              >
                Canvas {canvas._id.slice(-6)}
              </span>
              <button className="delete-button" onClick={() => handleDeleteCanvas(canvas._id)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {activeTab === 'shared' && (
        <ul className="canvas-list">
          {sharedCanvases.map(canvas => (
            <li 
              key={canvas._id} 
              className={`canvas-item ${canvas._id === canvasId ? 'selected' : ''}`}
            >
              <span 
                className="canvas-name" 
                onClick={() => handleCanvasClick(canvas._id)}
              >
                Canvas {canvas._id.slice(-6)}
                <small className="shared-by">by {canvas.owner?.email || 'Unknown'}</small>
              </span>
            </li>
          ))}
          {sharedCanvases.length === 0 && (
            <li className="no-canvases">
              No shared canvases yet
            </li>
          )}
        </ul>
      )}
      
      {isUserLoggedIn && canvasId && (
        <div className="share-container">
          <h4 className="share-title">Share Canvas</h4>
          <input
            type="email"
            placeholder="Enter email to share with"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSharing}
          />
          <button 
            className="share-button" 
            onClick={handleShare} 
            disabled={isSharing || !email.trim()}
          >
            {isSharing ? 'Sharing...' : 'Share Canvas'}
          </button>
          {error && <p className="error-message">{error}</p>}
          }
          {success && <p className="success-message">{success}</p>}
          }
        </div>
      )}
      
      {isUserLoggedIn ? (
        <button className="auth-button logout-button" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <button className="auth-button login-button" onClick={handleLogin}>
          Login
        </button>
      )}
    </div>
  );
};

export default Sidebar;