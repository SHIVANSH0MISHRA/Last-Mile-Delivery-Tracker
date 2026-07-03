import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to correct dashboard based on actual role
      if (user.role === 'admin') return <Navigate to="/admin" replace />;
      if (user.role === 'agent') return <Navigate to="/agent" replace />;
      return <Navigate to="/customer" replace />;
    }
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
