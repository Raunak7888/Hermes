// src/App.js
import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ForgotPasswordPage from './components/Auth/forgot';
import ProtectedRoute from './components/api/ProtectedRoute';
import SignupPage from './components/Auth/signup';
import LoginPage from './components/Auth/LoginPage';
import VerifyPage from './components/Auth/verify';
import ResetPasswordPage from './components/Auth/reset';
import ChatPage from './components/chat/ChatPage';
import { CreateGroup } from './components/chat/CreateGroup';
import Logout from './components/Auth/logout';
import FileView from './components/chat/FilesView';
import ThemeToggle from './components/util/ThemeToggle';
import LandingPage from './components/home'
import Loading from './components/util/Loading';
function App() {
  return (
    <Router>
      <AnimatePresence mode='wait'>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route
          element={<ProtectedRoute />}
          >
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/group" element={<CreateGroup />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/files" element={<FileView />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
