import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import LoadingSpinner from './LoadingSpinner';

/**
 * Payment Form Component with Stripe Elements
 */
export default function PaymentForm({ onSubmit, isLoading, error }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setIsProcessing(false);
        return;
      }

      await onSubmit();
    } catch (err) {
      console.error('Payment form error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>

      <div className="bg-white p-4 border border-gray-300 rounded-md">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isLoading || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        {isLoading || isProcessing ? (
          <span className="flex items-center justify-center">
            <LoadingSpinner size="sm" className="mr-2" />
            Processing...
          </span>
        ) : (
          'Complete Payment'
        )}
      </button>
    </form>
  );
}


