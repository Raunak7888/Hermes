// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import LoginPage from './components/login';
import SignupPage from './components/signup';
import ForgotPasswordPage from './components/forgot'
import VerifyPage from './components/verify';
import ResetPage from './components/reset';
import Ok from './components/ok';
import CreateGroup from './components/CreateGroup';
import Logout from './components/logout';
import FileView from './components/FilesView';
import Home from './components/home';

function App() {
  return (

    <Router>
      <AnimatePresence mode='wait'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/reset" element={<ResetPage />} />
          
        </Routes>
      </AnimatePresence>
      <Routes>
          <Route path="/chat" element={<Ok />} />
          <Route path="/Group" element={<CreateGroup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/files" element={<FileView />} />
      </Routes>
    </Router>
  );
}

export default App;
