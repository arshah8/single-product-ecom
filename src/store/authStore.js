import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth Store using Zustand
 * Manages authentication state and user information
 */
export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) => {
                if (accessToken) {
                    localStorage.setItem('authToken', accessToken);
                }
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: !!user && !!accessToken,
                });
            },

            logout: () => {
                // Clear auth tokens from localStorage
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');

                // Clear auth state
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });

                // Note: Cart clearing and SWR cache clearing should be handled
                // in the component that calls logout to avoid circular dependencies
            },

            updateUser: (userData) => {
                set((state) => ({
                    user: { ...state.user, ...userData },
                }));
            },

            // Role-based access control helpers
            hasRole: (role) => {
                const state = get();
                return state.user?.role === role;
            },

            isAdmin: () => {
                const state = get();
                return state.user?.role === 'admin';
            },

            isCustomer: () => {
                const state = get();
                return state.user?.role === 'customer' || !state.user?.role;
            },

            // Get user role (defaults to 'customer' if not set)
            getUserRole: () => {
                const state = get();
                return state.user?.role || 'customer';
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);