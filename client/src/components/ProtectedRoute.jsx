import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  
  // We use sessionStorage so that every new tab/window is treated as a fresh start
  const user = JSON.parse(sessionStorage.getItem("user"));

  // 1. If no user is found (e.g., link pasted in new tab), redirect to Login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Role-based protection
  // If user role is not in the allowed list, send them to User Home
  const userRole = user.role?.toLowerCase();
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  // 3. If everything is fine, show the page
  return children;
};

export default ProtectedRoute;