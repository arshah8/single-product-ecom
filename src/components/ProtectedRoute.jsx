import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Optionally checks for required role(s)
 */
export default function ProtectedRoute({ children, requiredRole, requiredRoles }) {
  const { isAuthenticated, hasRole, getUserRole } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for single required role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Navigate 
        to="/" 
        state={{ 
          from: location,
          error: 'Insufficient permissions. This page requires admin access.' 
        }} 
        replace 
      />
    );
  }

  // Check for multiple required roles (user must have at least one)
  if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/" 
          state={{ 
            from: location,
            error: 'Insufficient permissions. You do not have access to this page.' 
          }} 
          replace 
        />
      );
    }
  }

  return children;
}

