import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './index.module.css';
import boardContext from '../../store/board-context';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUserLoginStatus } = useContext(boardContext);

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com", // Replace with your actual Google Client ID
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the Google Sign-In button
      const googleButtonElement = document.getElementById("google-signin-button");
      if (googleButtonElement) {
        window.google.accounts.id.renderButton(
          googleButtonElement,
          {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
          }
        );
      }
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('https://api-whiteboard-az.onrender.com/api/users/google-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          credential: response.credential,
          action: 'login'
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('whiteboard_user_token', data.token);
        setUserLoginStatus(true);
        navigate('/whiteboard');
      } else {
        if (res.status === 404) {
          setError("No account found with this Google account. Please register first.");
        } else {
          setError(data.message || 'Google login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://api-whiteboard-az.onrender.com/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('whiteboard_user_token', data.token);
        setUserLoginStatus(true);
        navigate('/whiteboard');
      } else {
        if (response.status === 401) {
          setError('Incorrect password. Please try again.');
        } else if (response.status === 404) {
          setError('No account found with this email address.');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBackToHome}>
            ← Back to Home
          </button>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to your account to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div id="google-signin-button" className={styles.googleButton}></div>

          <div className={styles.divider}>
            <span>or continue with email</span>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>
            Don't have an account? 
            <Link to="/register" className={styles.link}> Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;