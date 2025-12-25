import { create } from 'zustand';
import { api } from '../services/api';

/**
 * Cart Store using Zustand
 * Manages shopping cart state and operations
 */
export const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  shouldOpenSidebar: false,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await api.getCart();
      set({ cart, isLoading: false, error: null });
      return cart;
    } catch (error) {
      // Don't throw for 404 or empty cart - just set cart to null
      if (error.status === 404 || error.message.includes('not found')) {
        set({ cart: null, isLoading: false, error: null });
        return null;
      }
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await api.addToCart(productId, quantity);
      set({ cart, isLoading: false, shouldOpenSidebar: true });
      return cart;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateCartItem: async (productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await api.updateCartItem(productId, quantity);
      set({ cart, isLoading: false });
      return cart;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeFromCart: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await api.removeFromCart(productId);
      set({ cart, isLoading: false });
      return cart;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearCart: () => {
    set({ 
      cart: null, 
      isLoading: false, 
      error: null 
    });
  },

  getCartTotal: () => {
    const { cart } = get();
    return cart?.total || 0;
  },

  getCartItemCount: () => {
    const { cart } = get();
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  },

  clearSidebarTrigger: () => {
    set({ shouldOpenSidebar: false });
  },

  triggerSidebarOpen: () => {
    set({ shouldOpenSidebar: true });
  },
}));

