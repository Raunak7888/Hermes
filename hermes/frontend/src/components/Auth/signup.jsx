import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
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

const SignupPage = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const trimmedEmail = email.trim();
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        // 1. Ensure all fields are filled
        if (!trimmedEmail || !trimmedUsername || !trimmedPassword) {
            setError("All fields are required.");
            return;
        }

        // 2. Enforce password length
        if (trimmedPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/signup`, {
                email: trimmedEmail,
                username: trimmedUsername,
                password: trimmedPassword,
            });

            if (response.status === 201) {
                setSuccess("Signup successful! Please verify your email.");
                setTimeout(() => {
                    setEmail("");
                    setUsername("");
                    setPassword("");
                    navigate("/verify");
                }, 2000);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Signup failed. Please try again with a different email or username.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <RandomPageTransition>
            {loading ? (
                <Loading message="Creating your account..." />
            ) : (
                <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-gradient-start to-gradient-end">
                    <motion.div
                        className="w-full max-w-md p-8 bg-background-form rounded-3xl shadow-2xl transition-colors duration-500"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <FiUser className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-center text-on-background mb-2">
                            Create Your Account
                        </h2>
                        <p className="text-center text-muted text-sm sm:text-base mb-8">
                            Start your journey with us today!
                        </p>

                        <form onSubmit={handleSignup} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-on-background mb-2"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="you@example.com"
                                        required
                                    />
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-on-background mb-2"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        id="username"
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        placeholder="Choose a username"
                                        required
                                    />
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-on-background mb-2"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type="password"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background-form text-on-background placeholder-muted transition-colors duration-300 shadow-inner"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="••••••••"
                                        required
                                    />
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-icon" />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 text-center">
                                    {error}
                                </p>
                            )}
                            {success && (
                                <p className="text-sm text-green-500 text-center">
                                    {success}
                                </p>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 bg-primary text-on-primary font-semibold rounded-xl text-lg hover:bg-blue-700 transition-colors duration-300 shadow-md ${
                                    loading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {loading ? "Creating..." : "Sign Up"}
                            </motion.button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted">
                            Already have an account?{" "}
                            <span
                                className="text-primary hover:underline cursor-pointer"
                                onClick={() => navigate("/login")}
                            >
                                Login here
                            </span>
                        </p>
                    </motion.div>
                </div>
            )}
        </RandomPageTransition>
    );
};

export default SignupPage;
