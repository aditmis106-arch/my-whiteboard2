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
  const [shareDebugInfo, setShareDebugInfo] = useState('');

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
      if (error.response?.status === 401) {
        setUserLoginStatus(false);
        localStorage.removeItem('whiteboard_user_token');
        navigate('/login');
      }
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
      if (error.response?.status === 401) {
        setUserLoginStatus(false);
        localStorage.removeItem('whiteboard_user_token');
        navigate('/login');
      }
    }
  };

  const handleCreateCanvas = async () => {
    try {
      const response = await axios.post('https://api-whiteboard-az.onrender.com/api/canvas/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Canvas created:', response.data);
      fetchCanvases();
      setCanvasId(response.data.canvasId);
      handleCanvasClick(response.data.canvasId);
      return response.data;
    } catch (error) {
      console.error('Error creating canvas:', error);
      if (error.response?.status === 401) {
        setUserLoginStatus(false);
        localStorage.removeItem('whiteboard_user_token');
        navigate('/login');
      }
      return null;
    }
  };

  const handleDeleteCanvas = async (id) => {
    if (!window.confirm('Are you sure you want to delete this canvas? This action cannot be undone.')) {
      return;
    }
    
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
      } else {
        const newCanvas = await handleCreateCanvas();
        if (newCanvas) {
          setCanvasId(newCanvas._id);
          handleCanvasClick(newCanvas._id);
        }
      }
    } catch (error) {
      console.error('Error deleting canvas:', error);
      alert('Failed to delete canvas. Please try again.');
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const currentCanvasId = id || canvasId;
    if (!currentCanvasId) {
      setError("No canvas selected to share.");
      return;
    }

    try {
      setIsSharing(true);
      setError("");
      setSuccess("");
      setShareDebugInfo(`Sharing canvas ${currentCanvasId} with ${email.trim()}...`);

      console.log('Sharing request:', {
        canvasId: currentCanvasId,
        email: email.trim(),
        token: token ? 'Present' : 'Missing'
      });

      const response = await axios.post(
        `https://api-whiteboard-az.onrender.com/api/canvas/share`,
        { 
          canvasId: currentCanvasId,
          email: email.trim() 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Share response:', response.data);
      setShareDebugInfo(`Share successful! Response: ${JSON.stringify(response.data)}`);

      if (response.status === 200) {
        setSuccess(`Canvas shared successfully with ${email.trim()}!`);
        setEmail("");
        
        // Refresh shared canvases list
        await fetchSharedCanvases();
        
        setTimeout(() => {
          setSuccess("");
          setShareDebugInfo("");
        }, 5000);
      }
    } catch (err) {
      console.error('Share error:', err);
      console.error('Error response:', err.response?.data);
      
      setShareDebugInfo(`Share failed: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
      
      if (err.response?.status === 404) {
        setError("User with this email not found. They need to register first.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid request. Please try again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to share this canvas.");
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        setUserLoginStatus(false);
        localStorage.removeItem('whiteboard_user_token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || "Failed to share canvas. Please try again.");
      }
      
      setTimeout(() => {
        setError("");
        setShareDebugInfo("");
      }, 8000);
    } finally {
      setIsSharing(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const currentCanvasId = id || canvasId;

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
      
      {activeTab === 'my-canvases' && (
        <ul className="canvas-list">
          {canvases.map(canvas => (
            <li 
              key={canvas._id} 
              className={`canvas-item ${canvas._id === currentCanvasId ? 'selected' : ''}`}
            >
              <span 
                className="canvas-name" 
                onClick={() => handleCanvasClick(canvas._id)}
              >
                Canvas {canvas._id.slice(-6)}
                <small className="canvas-date">
                  {new Date(canvas.updatedAt || canvas.createdAt).toLocaleDateString()}
                </small>
              </span>
              <button 
                className="delete-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCanvas(canvas._id);
                }}
                title="Delete canvas"
              >
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
              className={`canvas-item ${canvas._id === currentCanvasId ? 'selected' : ''}`}
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
      
      {isUserLoggedIn && currentCanvasId && (
        <div className="share-container">
          <h4 className="share-title">Share Canvas</h4>
          <input
            type="email"
            placeholder="Enter email to share with"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSharing}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleShare();
              }
            }}
          />
          <button 
            className="share-button" 
            onClick={handleShare} 
            disabled={isSharing || !email.trim()}
          >
            {isSharing ? 'Sharing...' : 'Share Canvas'}
          </button>
          
          {shareDebugInfo && (
            <div className="debug-info">
              <small>{shareDebugInfo}</small>
            </div>
          )}
          
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
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