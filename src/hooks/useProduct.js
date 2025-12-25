import useSWR from 'swr';
import { api } from '../services/api';

/**
 * Custom hook for fetching a single product by ID
 */
export function useProduct(productId) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `/products/${productId}` : null,
    (key) => api.getProduct(key.split('/').pop())
  );

  return {
    product: data,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

