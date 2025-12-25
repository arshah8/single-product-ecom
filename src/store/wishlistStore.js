import { create } from 'zustand';
import { api } from '../services/api';

/**
 * Wishlist Store using Zustand
 * Manages wishlist state and operations
 */
export const useWishlistStore = create((set, get) => ({
  wishlists: null,
  activeWishlistId: null,
  isLoading: false,
  error: null,

  setActiveWishlistId: (wishlistId) => {
    set({ activeWishlistId: wishlistId || null });
    try {
      if (wishlistId) {
        localStorage.setItem('activeWishlistId', wishlistId);
      } else {
        localStorage.removeItem('activeWishlistId');
      }
    } catch {
      // ignore storage errors
    }
  },

  fetchWishlists: async (wishlistId = null) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getWishlists(wishlistId);
      // Handle both single wishlist and array of wishlists
      if (Array.isArray(data)) {
        // Initialize/repair active wishlist selection
        const { activeWishlistId } = get();
        let nextActiveId = activeWishlistId;
        if (!nextActiveId) {
          try {
            nextActiveId = localStorage.getItem('activeWishlistId');
          } catch {
            // ignore
          }
        }
        if (nextActiveId && !data.find(w => w._id === nextActiveId)) {
          nextActiveId = null;
        }
        if (!nextActiveId && data.length > 0) {
          nextActiveId = (data.find(w => w.isDefault) || data[0])._id;
        }

        set({ wishlists: data, activeWishlistId: nextActiveId || null, isLoading: false, error: null });
        return data;
      } else {
        set({ wishlists: [data], activeWishlistId: data?._id || null, isLoading: false, error: null });
        return [data];
      }
    } catch (error) {
      // Don't throw for 404 or empty wishlist - just set wishlists to empty array
      if (error.status === 404 || error.message.includes('not found')) {
        set({ wishlists: [], activeWishlistId: null, isLoading: false, error: null });
        return [];
      }
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addToWishlist: async (productId, wishlistId = null) => {
    set({ isLoading: true, error: null });
    try {
      const wishlist = await api.addToWishlist(productId, wishlistId);
      // Update local state
      const { wishlists } = get();
      if (wishlists) {
        const updatedWishlists = wishlists.map(w => 
          w._id === wishlist._id ? wishlist : w
        );
        // If wishlist doesn't exist in array, add it
        if (!updatedWishlists.find(w => w._id === wishlist._id)) {
          updatedWishlists.push(wishlist);
        }
        set({ wishlists: updatedWishlists, isLoading: false });
      } else {
        set({ wishlists: [wishlist], isLoading: false });
      }
      return wishlist;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeFromWishlist: async (wishlistId, productId) => {
    set({ isLoading: true, error: null });
    try {
      const wishlist = await api.removeFromWishlist(wishlistId, productId);
      // Update local state
      const { wishlists } = get();
      if (wishlists) {
        const updatedWishlists = wishlists.map(w => 
          w._id === wishlist._id ? wishlist : w
        );
        set({ wishlists: updatedWishlists, isLoading: false });
      }
      return wishlist;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createWishlist: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const wishlist = await api.createWishlist(name);
      // Add to local state
      const { wishlists } = get();
      set({ wishlists: [...(wishlists || []), wishlist], isLoading: false });
      return wishlist;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateWishlist: async (wishlistId, data) => {
    set({ isLoading: true, error: null });
    try {
      const wishlist = await api.updateWishlist(wishlistId, data);
      // Update local state
      const { wishlists } = get();
      if (wishlists) {
        const updatedWishlists = wishlists.map(w => 
          w._id === wishlist._id ? wishlist : w
        );
        set({ wishlists: updatedWishlists, isLoading: false });
      }
      return wishlist;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteWishlist: async (wishlistId) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteWishlist(wishlistId);
      // Remove from local state
      const { wishlists } = get();
      if (wishlists) {
        const updatedWishlists = wishlists.filter(w => w._id !== wishlistId);
        set({ wishlists: updatedWishlists, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  shareWishlist: async (wishlistId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.shareWishlist(wishlistId);
      // Update wishlist in local state
      const { wishlists } = get();
      if (wishlists) {
        const updatedWishlists = wishlists.map(w => 
          w._id === wishlistId ? { ...w, isShared: true, shareToken: result.shareToken } : w
        );
        set({ wishlists: updatedWishlists, isLoading: false });
      }
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  revokeShare: async (wishlistId) => {
    set({ isLoading: true, error: null });
    try {
      const wishlist = await api.revokeWishlistShare(wishlistId);
      // Update local state
      const { wishlists } = get();
      if (wishlists) {
        const updatedWishlists = wishlists.map(w => 
          w._id === wishlist._id ? wishlist : w
        );
        set({ wishlists: updatedWishlists, isLoading: false });
      }
      return wishlist;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addToCart: async (wishlistId, productIds = null) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.addWishlistToCart(wishlistId, productIds);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Helper to check if product is in any wishlist
  isProductInWishlist: (productId) => {
    const { wishlists } = get();
    if (!wishlists || wishlists.length === 0) return false;
    
    const productIdStr = productId.toString();
    return wishlists.some(wishlist => 
      wishlist.productIds && wishlist.productIds.some(id => {
        const idStr = typeof id === 'object' ? id._id || id.toString() : id.toString();
        return idStr === productIdStr;
      })
    );
  },

  // Helper to get wishlist count (total products across all wishlists)
  getWishlistItemCount: () => {
    const { wishlists } = get();
    if (!wishlists || wishlists.length === 0) return 0;
    
    // Count unique products across all wishlists
    const productIdsSet = new Set();
    wishlists.forEach(wishlist => {
      if (wishlist.productIds) {
        wishlist.productIds.forEach(id => {
          const idStr = typeof id === 'object' ? id._id || id.toString() : id.toString();
          productIdsSet.add(idStr);
        });
      }
    });
    
    return productIdsSet.size;
  },

  clearWishlists: () => {
    try {
      localStorage.removeItem('activeWishlistId');
    } catch {
      // ignore storage errors
    }
    set({ 
      wishlists: null, 
      activeWishlistId: null,
      isLoading: false, 
      error: null 
    });
  },
}));




