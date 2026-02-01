import React from "react";
import Cookies from "js-cookie";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import RandomPageTransition from "../randomPageTrasition";
import Loading from "../util/Loading";

const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const Logout = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      setLoading(true);
      Cookies.remove("Authorization", { secure: true, sameSite: "Strict" });
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLogout = () => {
    navigate("/chat");
  };

  return (
    <RandomPageTransition>
      {loading ? (
        <Loading message="Logging out..." />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gradient-start to-gradient-end px-4 py-8">
          <motion.div
            className="bg-background-form p-8 rounded-3xl shadow-2xl w-full max-w-md text-center space-y-6 transition-colors duration-500"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <FiLogOut className="h-8 w-8 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-on-background">
              Are you sure you want to logout?
            </p>
            <p className="text-muted text-sm">
              You'll need to log back in to access your account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full sm:w-auto bg-red-600 text-white px-6 py-3 rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors duration-300 shadow-md"
              >
                <div className="flex items-center justify-center gap-2">
                  <FiLogOut className="h-5 w-5" />
                  <span>Yes, Logout</span>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelLogout}
                className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-700 text-on-background px-6 py-3 rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 shadow-md"
              >
                <div className="flex items-center justify-center gap-2">
                  <FiX className="h-5 w-5" />
                  <span>Cancel</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </RandomPageTransition>
  );
};

export default Logout;  