import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiKey } from 'react-icons/fi';
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

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/reset`, {
        email,
        newPassword,
        passwordResetCode,
      });

      if (response.status === 200) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          setEmail('');
          setNewPassword('');
          setPasswordResetCode('');
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Password reset failed. Please check your email, password, and code.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <RandomPageTransition>
      {loading ? (
        <Loading message="Resetting password..." />
      ) : (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gradient-start to-gradient-end">
        <motion.div
          className="w-full max-w-md bg-background-form p-8 rounded-3xl shadow-2xl space-y-6 transition-colors duration-500"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FiKey className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-on-background">Reset Password</h2>
          <p className="text-center text-muted text-sm sm:text-base">
            Enter your email, the code sent to you, and your new password.
          </p>
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-sm font-medium text-on-background mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                  required
                />
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-background mb-2">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                  required
                />
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-background mb-2">Reset Code</label>
              <div className="relative">
                <input
                  type="text"
                  value={passwordResetCode}
                  onChange={(e) => setPasswordResetCode(e.target.value)}
                  placeholder="Enter the reset code"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                  required
                />
                <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center">{success}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-primary text-on-primary font-semibold rounded-xl text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </motion.button>
          </form>
        </motion.div>
      </div>)}
    </RandomPageTransition>
  );
};

export default ResetPasswordPage;