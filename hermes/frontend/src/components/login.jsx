// src/components/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import config from './backend_url';
import RandomPageTransition from './randomPageTrasition';
import "./init";

const API_BASE_URL = `${config.apiBaseUrl}/auth`; // Update with your actual backend URL

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const response = await axios.post(
          `${API_BASE_URL}/login`,
          { "email":email, "password":password },
          {
            headers: {
              'Content-Type': 'application/json',
            }}
        );
      

      if (response.status === 200) {
        const token = response.data.token;

        // Set JWT as a cookie with js-cookie
        Cookies.set('Authorization', "Bearer " + token, { expires: 1, secure: true, sameSite: 'Strict' });

        // console.log('Login successful');
        navigate('/chat');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RandomPageTransition>
    <div className="center">
      <div className="anime">
      <div className="card">
        <h1 className='heading-primary'>Welcome to Chat App</h1>
        <h2 className='heading-secondary'>Login</h2>
        <form className='form_group' onSubmit={handleLogin}>
          <div >
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
          <div >
            <label className='label'>Password:</label>
            <input
              className='input-field'
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className='card-button' disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className='pt-10'>Don't have an account? <span className ='link' onClick={() => navigate('/signup')}>Sign up here</span></p>
        <p className='pt-3'>Forgot your password? <span className ='link' onClick={() => navigate('/forgot')}>Reset here</span></p>
      </div>
      </div>
    </div>
    </RandomPageTransition>
  );
};

export default LoginPage;
