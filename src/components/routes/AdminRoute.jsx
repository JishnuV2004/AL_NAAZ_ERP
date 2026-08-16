import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role: STAFF cannot access admin-only routes
  const userRole = (user?.role || '').toUpperCase();
  if (userRole === 'STAFF') {
    return <Navigate to="/inventory" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
