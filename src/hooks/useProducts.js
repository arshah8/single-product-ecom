import useSWR from 'swr';
import { api } from '../services/api';

/**
 * SWR fetcher function for products
 */
const fetcher = (url) => {
  const queryString = url.split('?')[1];
  const params = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};
  return api.getProducts(params);
};

/**
 * Custom hook for fetching products with SWR
 * Supports search, filtering, sorting, and pagination
 */
export function useProducts(options = {}) {
  const {
    search = '',
    category = '',
    minPrice = '',
    maxPrice = '',
    inStock = '',
    sort = '',
    page = 1,
    limit = 12,
  } = options;

  // Build query params
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (minPrice) params.append('minPrice', minPrice);
  if (maxPrice) params.append('maxPrice', maxPrice);
  if (inStock !== '') params.append('inStock', inStock);
  if (sort) params.append('sort', sort);
  params.append('page', page);
  params.append('limit', limit);

  const queryString = params.toString();
  const key = queryString ? `/products?${queryString}` : '/products';

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  return {
    products: data?.products || [],
    pagination: data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 },
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

