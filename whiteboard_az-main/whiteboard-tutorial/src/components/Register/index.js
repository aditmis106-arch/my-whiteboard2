import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './index.module.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
    setSuccess('');
    
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
        setSuccess('Registration successful! Please check your email to verify your account before logging in.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Don't navigate immediately, let user verify email first
      } else {
        if (response.status === 409) {
          setError('An account with this email already exists. Please login instead.');
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
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
        setSuccess('Verification email sent! Please check your inbox.');
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
              {error.includes('verify') && (
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

          {success && (
            <div className={styles.successMessage}>
              {success}
              <div className={styles.actionButtons}>
                <button 
                  type="button" 
                  className={styles.resendButton}
                  onClick={handleResendVerification}
                  disabled={isLoading}
                >
                  Resend Verification Email
                </button>
                <Link to="/login" className={styles.loginLink}>
                  Go to Login
                </Link>
              </div>
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