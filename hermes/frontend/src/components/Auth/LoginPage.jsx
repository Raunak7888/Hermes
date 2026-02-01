// src/components/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import config from '../api/backend_url';
import RandomPageTransition from '../randomPageTrasition';
import Loading from "../util/Loading";

const API_BASE_URL = `${config.apiBaseUrl}/auth`;

const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

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
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 200) {
        const token = response.data.token;
        Cookies.set('Authorization', `${token}`, {
          expires: 1,
          secure: true,
          sameSite: 'Strict'
        });
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
      {loading ? (
        <Loading message="Logging in..." />
      ) : (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gradient-start to-gradient-end px-4 py-8">
        <motion.div
          className="w-full max-w-md bg-background-form rounded-3xl shadow-2xl p-8 sm:p-10 transition-colors duration-500"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <FiLock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-on-background">Welcome to Hermes</h1>
          <h2 className="text-lg text-center text-muted mb-6">Login to your account</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-background mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-background mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium text-center">{error}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-primary text-on-primary font-semibold rounded-xl text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          <div className="text-center mt-5 text-sm text-muted">
            <p>
              Don't have an account?{' '}
              <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate('/signup')}>
                Sign up here
              </span>
            </p>
            <p className="mt-2">
              Forgot your password?{' '}
              <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate('/forgot')}>
                Reset here
              </span>
            </p>
          </div>
        </motion.div>
      </div>)}
    </RandomPageTransition>
  );
};

export default LoginPage;