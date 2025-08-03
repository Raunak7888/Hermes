// src/components/VerifyPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from './backend_url';
import RandomPageTransition from './randomPageTrasition';

const API_BASE_URL = `${config.apiBaseUrl}/auth`; 


const VerifyPage = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/verify`, {
        email: email,
        verificationCode: verificationCode,
      });

      if (response.status === 200) {
        setMessage('Verification successful! You can now Login to Your Account.');
        // Redirect to reset password page or show success message
        navigate('/login');
      }
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      console.error('Verification error:', err);
    }
  };

  return (
    <RandomPageTransition>
    <div className="center">
      <div className="anime">
      <div className="card">
        <h2 className="heading-secondary">Verify Your Email</h2>
        <form className="form-group" onSubmit={handleVerify}>
          <div className="form-group">
            <label className="label" htmlFor="email">Email:</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="form-group verify-code">
            <label className="label" htmlFor="verificationCode">Verification Code:</label>
            <input
              className="input-field"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter the verification code sent to your email"
              required
            />
          </div>
          {message && <p className="message-success">{message}</p>}
          {error && <p className="message-error">{error}</p>}
          <button className="card-button" type="submit">Verify</button>
        </form>
      </div>
      </div>
    </div>
    </RandomPageTransition>
  );
};

export default VerifyPage;
