import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './index.module.css';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      try {
        const response = await fetch(`https://api-whiteboard-az.onrender.com/api/users/verify-email?token=${token}`, {
          method: 'GET',
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in to your account.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed. The link may be expired or invalid.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>Email Verification</h2>
        </div>
        
        <div className={styles.content}>
          {status === 'verifying' && (
            <div className={styles.verifying}>
              <div className={styles.spinner}></div>
              <p>Verifying your email address...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className={styles.success}>
              <div className={styles.successIcon}>✓</div>
              <p>{message}</p>
              <button className={styles.loginButton} onClick={handleGoToLogin}>
                Go to Login
              </button>
            </div>
          )}
          
          {status === 'error' && (
            <div className={styles.error}>
              <div className={styles.errorIcon}>✗</div>
              <p>{message}</p>
              <div className={styles.actionButtons}>
                <button className={styles.homeButton} onClick={handleGoToHome}>
                  Go to Home
                </button>
                <button className={styles.loginButton} onClick={handleGoToLogin}>
                  Try Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;