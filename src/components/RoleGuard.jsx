import { useAuthStore } from '../store/authStore';

/**
 * Role Guard Component
 * Conditionally renders children based on user role
 * 
 * @param {React.ReactNode} children - Content to render if role check passes
 * @param {string} requiredRole - Single role required to see content
 * @param {string[]} requiredRoles - Array of roles (user needs at least one)
 * @param {React.ReactNode} fallback - Content to render if role check fails (optional)
 * @param {boolean} showNothing - If true, shows nothing when role check fails (default: false)
 */
export default function RoleGuard({ 
  children, 
  requiredRole, 
  requiredRoles, 
  fallback = null,
  showNothing = false 
}) {
  const { hasRole, isAuthenticated } = useAuthStore();

  // If not authenticated, show fallback or nothing
  if (!isAuthenticated) {
    return showNothing ? null : fallback;
  }

  // Check for single required role
  if (requiredRole) {
    if (hasRole(requiredRole)) {
      return children;
    }
    return showNothing ? null : fallback;
  }

  // Check for multiple required roles (user must have at least one)
  if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (hasRequiredRole) {
      return children;
    }
    return showNothing ? null : fallback;
  }

  // If no role requirements specified, show children
  return children;
}

