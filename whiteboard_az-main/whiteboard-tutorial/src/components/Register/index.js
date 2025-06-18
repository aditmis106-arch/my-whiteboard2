import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './index.module.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com",
        callback: handleGoogleResponse,
      });

      // Render the Google Sign-In button
      const googleButtonElement = document.getElementById("google-signup-button");
      if (googleButtonElement) {
        window.google.accounts.id.renderButton(
          googleButtonElement,
          {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signup_with",
            shape: "rectangular",
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
          action: 'register'
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Registration successful! Please login to continue.');
        navigate('/login');
      } else {
        setError(data.message || 'Google registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Google registration error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://api-whiteboard-az.onrender.com/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('Registration successful! Please login to continue.');
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBackToHome}>
            ← Back to Home
          </button>
          <h2 className={styles.title}>Create Account</h2>
          <p className={styles.subtitle}>Join thousands of users collaborating with our whiteboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.registerForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div id="google-signup-button" className={styles.googleButton}></div>

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
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>
            Already have an account? 
            <Link to="/login" className={styles.link}> Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;