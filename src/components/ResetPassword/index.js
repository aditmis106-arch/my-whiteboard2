import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './index.module.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setError('Invalid reset link. Please request a new password reset.');
        return;
      }

      try {
        const response = await fetch(`https://api-whiteboard-az.onrender.com/api/users/validate-reset-token?token=${token}`, {
          method: 'GET',
        });
        
        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError('This reset link has expired or is invalid. Please request a new password reset.');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenValid(false);
        setError('Network error. Please check your connection and try again.');
      }
    };

    validateToken();
  }, [token]);

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
      const response = await fetch('https://api-whiteboard-az.onrender.com/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
      } else {
        if (response.status === 400) {
          setError('This reset link has expired or is invalid. Please request a new password reset.');
        } else {
          setError(data.message || 'Failed to reset password. Please try again.');
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleRequestNewReset = () => {
    navigate('/forgot-password');
  };

  if (tokenValid === null) {
    return (
      <div className={styles.resetPasswordContainer}>
        <div className={styles.resetPasswordCard}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className={styles.resetPasswordContainer}>
        <div className={styles.resetPasswordCard}>
          <div className={styles.error}>
            <div className={styles.errorIcon}>✗</div>
            <h2 className={styles.title}>Invalid Reset Link</h2>
            <p className={styles.errorText}>{error}</p>
            <div className={styles.actionButtons}>
              <button className={styles.primaryButton} onClick={handleRequestNewReset}>
                Request New Reset Link
              </button>
              <button className={styles.secondaryButton} onClick={handleGoToLogin}>
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.resetPasswordContainer}>
        <div className={styles.resetPasswordCard}>
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.title}>Password Reset Successful</h2>
            <p className={styles.successText}>Your password has been successfully reset. You can now log in with your new password.</p>
            <button className={styles.primaryButton} onClick={handleGoToLogin}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resetPasswordContainer}>
      <div className={styles.resetPasswordCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>Set New Password</h2>
          <p className={styles.subtitle}>Enter your new password below</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.resetPasswordForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your new password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
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
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>
            Remember your password? 
            <button className={styles.linkButton} onClick={handleGoToLogin}>
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;