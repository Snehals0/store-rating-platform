import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    // Redirect unauthenticated users to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect authenticated but unauthorized users to their respective dashboards
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'OWNER') return <Navigate to="/owner" replace />;
    if (user.role === 'USER') return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
