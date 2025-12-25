import { useState } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for checkout operations
 */
export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCheckoutSession = async (checkoutData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.createCheckout(checkoutData);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to create checkout session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCheckout = async (confirmData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.confirmCheckout(confirmData);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to confirm checkout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    confirmCheckout,
    isLoading,
    error,
  };
}


