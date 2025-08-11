// src/components/Forgot.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { motion } from "framer-motion";
import config from "../api/backend_url";
import RandomPageTransition from "../randomPageTrasition";
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

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/forget`, { email });
      if (response.status === 200) {
        setMessage("✅ Check your email for a password reset link!");
        setTimeout(() => navigate("/reset"), 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error sending reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <RandomPageTransition>
      {loading ? (
        <Loading message="Sending reset link..." />
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end px-4 py-8">
          <motion.div
            className="w-full max-w-md bg-background-form rounded-3xl shadow-2xl p-8 sm:p-10 transition-colors duration-500"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <FiMail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center text-on-background mb-2">
              Forgot Your Password?
            </h2>
            <p className="text-center text-muted mb-8 text-sm sm:text-base">
              No worries! We'll send you a link to reset it.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-on-background mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                    placeholder="Enter your email"
                  />
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-primary text-on-primary font-semibold rounded-xl text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </motion.button>

              {message && (
                <p className="text-green-500 text-sm text-center mt-4">
                  {message}
                </p>
              )}
              {error && (
                <p className="text-red-500 text-sm text-center mt-4">{error}</p>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </RandomPageTransition>
  );
};

export default ForgotPasswordPage;