import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
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

const VerifyPage = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/verify`, {
        email,
        verificationCode,
      });

      if (response.status === 200) {
        setMessage('Verification successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RandomPageTransition>
      {loading ? (
        <Loading message="Verifying account..." />
      ) : (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-gradient-start to-gradient-end">
        <motion.div
          className="w-full max-w-md bg-background-form p-8 rounded-3xl shadow-2xl space-y-6 transition-colors duration-500"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <FiCheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-on-background mb-2">
            Verify Your Email
          </h2>
          <p className="text-center text-muted text-sm sm:text-base mb-8">
            Enter the verification code sent to your email to activate your account.
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-background mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                  placeholder="Enter your email"
                  required
                />
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
              </div>
            </div>

            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-on-background mb-2">
                Verification Code
              </label>
              <div className="relative">
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                  placeholder="Enter the code sent to your email"
                  required
                />
                <FiCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
              </div>
            </div>

            {message && <p className="text-green-500 text-sm text-center">{message}</p>}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-primary text-on-primary font-semibold rounded-xl text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Verifying..." : "Verify Account"}
            </motion.button>
          </form>
        </motion.div>
      </div>)}
    </RandomPageTransition>
  );
};

export default VerifyPage;