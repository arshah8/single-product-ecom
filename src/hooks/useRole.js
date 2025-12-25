import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for role-based access control
 * 
 * @returns {Object} Role checking utilities
 */
export function useRole() {
    const { hasRole, isAdmin, isCustomer, getUserRole, user } = useAuthStore();

    return {
        // Check if user has a specific role
        hasRole,

        // Check if user is admin
        isAdmin: isAdmin(),

        // Check if user is customer
        isCustomer: isCustomer(),

        // Get current user role
        role: getUserRole(),

        // Get full user object
        user,

        // Helper to check multiple roles (user needs at least one)
        hasAnyRole: (...roles) => {
            return roles.some(role => hasRole(role));
        },

        // Helper to check if user has all specified roles
        hasAllRoles: (...roles) => {
            return roles.every(role => hasRole(role));
        },
    };
}