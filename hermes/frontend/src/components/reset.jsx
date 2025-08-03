// src/components/ResetPasswordPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from './backend_url';
import RandomPageTransition from './randomPageTrasition';

const API_BASE_URL = `${config.apiBaseUrl}/auth`; // Update with your actual backend URL

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordResetCode, setPasswordResetCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/reset`, {
        email,
        newPassword,
        passwordResetCode,
      });

      if (response.status === 200) { 
        setSuccess('Password reset successful');
        setEmail('');
        setNewPassword('');
        setPasswordResetCode('');
        navigate('/login');
      }
    } catch (err) {
      setError('Password reset failed. Please try again.');
      console.error('Password reset error:', err);
    }
  };

  return (
    <RandomPageTransition>  
    <div className="center">
      <div className="anime">
    <div className="card">
      <h2 className='heading-secondary'>Reset Password</h2>
      <form className='form-group' onSubmit={handleResetPassword}>
        <div>
          <label className='label'>Email:</label>
          <input
            className='input-field'
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter your email'
            required
          />
        </div>
        <div>
          <label className='label'>New Password:</label>
          <input
            className='input-field'
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder='Enter your new password'
            required
          />
        </div>
        <div>
          <label className='label'>Reset Code:</label>
          <input
            className='input-field'
            type="text"
            value={passwordResetCode}
            onChange={(e) => setPasswordResetCode(e.target.value)}
            placeholder='Enter the reset code'
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button className="card-button" type="submit">Reset Password</button>
      </form>
    </div>
    </div>
    </div>
    </RandomPageTransition>
  );
};

export default ResetPasswordPage;
