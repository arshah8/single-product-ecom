import { useEffect } from 'react';
import useSWR from 'swr';
import { api } from '../services/api';
import { useCartStore } from '../store/cartStore';

/**
 * Custom hook for fetching cart with SWR
 * Syncs with Zustand store for real-time updates
 */
export function useCart() {
  const storeCart = useCartStore((state) => state.cart);
  
  const { data, error, isLoading, mutate } = useSWR(
    '/cart',
    async () => {
      try {
        return await api.getCart();
      } catch (err) {
        // Return null for 404 (empty cart) instead of throwing
        if (err.status === 404 || err.message?.includes('not found')) {
          return null;
        }
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false, // Don't retry on 404
    }
  );

  // Update SWR cache when store cart changes (from cart actions)
  useEffect(() => {
    if (storeCart) {
      mutate(storeCart, false); // Update cache without revalidating
    }
  }, [storeCart, mutate]);

  // Use store cart if it's more recent or if SWR hasn't loaded yet
  const cart = storeCart || data;

  return {
    cart,
    isLoading,
    isError: error && error.status !== 404,
    error,
    mutate,
  };
}

