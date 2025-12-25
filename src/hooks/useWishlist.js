import useSWR from 'swr';
import { api } from '../services/api';

/**
 * Custom hook for fetching wishlist data using SWR
 * Supports both single wishlist and multiple wishlists
 */
export function useWishlist(wishlistId = null) {
  const { data, error, isLoading, mutate } = useSWR(
    wishlistId ? `wishlist-${wishlistId}` : 'wishlists',
    async () => {
      if (wishlistId) {
        return await api.getWishlistById(wishlistId);
      }
      return await api.getWishlists();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const wishlistsList = !wishlistId
    ? (Array.isArray(data) ? data : data ? [data] : [])
    : null;

  return {
    wishlists: wishlistsList,
    wishlist: wishlistId ? data : null,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

/**
 * Custom hook for fetching shared wishlist
 */
export function useSharedWishlist(shareToken) {
  const { data, error, isLoading, mutate } = useSWR(
    shareToken ? `shared-wishlist-${shareToken}` : null,
    async () => {
      if (!shareToken) return null;
      return await api.viewSharedWishlist(shareToken);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    wishlist: data,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}




