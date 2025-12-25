import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { api } from '../services/api';
import useSWR from 'swr';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Order Confirmation Page
 */
export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  // Fetch order details (in a real app, you'd have an endpoint for this)
  // For now, we'll just display the order number
  useEffect(() => {
    // Clear cart after successful order
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-green-600 mb-4">
          <svg
            className="w-20 h-20 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-lg text-gray-600 mb-2">
          Thank you for your purchase.
        </p>
        <p className="text-xl font-semibold text-gray-900 mb-8">
          Order Number: <span className="text-blue-600">{orderNumber}</span>
        </p>

        <div className="space-y-4">
          <p className="text-gray-600">
            You will receive an email confirmation shortly with your order details.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              Continue Shopping
            </Link>
            <Link
              to="/orders"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors font-semibold"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


