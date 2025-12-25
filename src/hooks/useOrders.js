import useSWR from 'swr';
import { api } from '../services/api';

/**
 * SWR hook for fetching order history
 * Uses the new /orders endpoint
 */
export function useOrders(page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    `/orders?page=${page}&limit=${limit}`,
    () => api.getOrders(page, limit)
  );

  return {
    orders: data?.orders || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching a single order by order number
 * Uses the new /orders/:orderNumber endpoint
 */
export function useOrder(orderNumber) {
  const { data, error, isLoading, mutate } = useSWR(
    orderNumber ? `/orders/${orderNumber}` : null,
    () => api.getOrder(orderNumber)
  );

  return {
    order: data,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

/**
 * SWR hook for tracking order status (no auth required)
 * Uses the new /orders/:orderNumber/track endpoint
 */
export function useOrderTracking(orderNumber) {
  const { data, error, isLoading, mutate } = useSWR(
    orderNumber ? `/orders/${orderNumber}/track` : null,
    () => api.trackOrder(orderNumber)
  );

  return {
    tracking: data,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

