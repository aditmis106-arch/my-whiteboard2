import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './index.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('https://api-whiteboard-az.onrender.com/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password reset link has been sent to your email address. Please check your inbox and follow the instructions.');
        setEmail('');
      } else {
        if (response.status === 404) {
          setError('No account found with this email address.');
        } else {
          setError(data.message || 'Failed to send reset email. Please try again.');
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles.forgotPasswordCard}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBackToLogin}>
            ← Back to Login
          </button>
          <h2 className={styles.title}>Reset Password</h2>
          <p className={styles.subtitle}>Enter your email address and we'll send you a link to reset your password</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.forgotPasswordForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {message && (
            <div className={styles.successMessage}>
              {message}
              <div className={styles.actionButtons}>
                <button 
                  type="button" 
                  className={styles.resendButton}
                  onClick={handleSubmit}
                  disabled={isLoading || !email}
                >
                  Resend Email
                </button>
                <Link to="/login" className={styles.loginLink}>
                  Back to Login
                </Link>
              </div>
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading || !email}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>
            Remember your password? 
            <Link to="/login" className={styles.link}> Sign in here</Link>
          </p>
          <p>
            Don't have an account? 
            <Link to="/register" className={styles.link}> Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;