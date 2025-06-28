import React, { useState, useContext } from 'react';
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
        } else if (response.status === 403) {
          setError('Please verify your email before logging in. Check your inbox for the verification link.');
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

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://api-whiteboard-az.onrender.com/api/users/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setError('Verification email sent! Please check your inbox.');
      } else {
        setError(data.message || 'Failed to send verification email.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              {error.includes('verify your email') && (
                <button 
                  type="button" 
                  className={styles.resendButton}
                  onClick={handleResendVerification}
                  disabled={isLoading}
                >
                  Resend Verification Email
                </button>
              )}
            </div>
          )}
          
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