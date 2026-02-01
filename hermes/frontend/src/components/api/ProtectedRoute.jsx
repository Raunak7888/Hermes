// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

/**
 * A route guard that protects access to authenticated routes.
 * Checks for the presence of a valid token in cookies.
 */
const ProtectedRoute = () => {
  const token = Cookies.get('Authorization');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
