// src/components/SignupPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import config from './backend_url';
import RandomPageTransition from './randomPageTrasition';

const API_BASE_URL = `${config.apiBaseUrl}/auth`; 

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        email,
        username,
        password,
      });

      if (response.status === 201) { // Assuming 201 status code for successful creation
        setSuccess('Signup successful! Please login.');
        setEmail('');
        setUsername('');
        setPassword('');
        navigate('/verify')
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
      console.error('Signup error:', err);
    }
  };

  return (
    <RandomPageTransition>
    <div className="center">
      <div className="anime">
      <div className="card">
        <h2 className="heading-secondary">Sign Up</h2>
        <form onSubmit={handleSignup} className="form-group">
          <div >
            <label className="label" htmlFor="email">Email:</label>
            <input
              className="input-field"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter Email'
              required
            />
          </div>
          <div >
            <label className="label" htmlFor="username">Username:</label>
            <input
              className="input-field"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Enter Username'
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password:</label>
            <input
              className="input-field"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter Password'
              required
            />
          </div>
          {error && <p className="signup-error">{error}</p>}
          {success && <p className="signup-success">{success}</p>}
          <button type="submit" className="card-button">Sign Up</button>
        </form>
        <p>
          Already have an account? <span className="link" onClick={() => navigate('/login')}>Login here</span>
        </p>
      </div>
      </div>
    </div>
    </RandomPageTransition>
  );
};

export default SignupPage;
