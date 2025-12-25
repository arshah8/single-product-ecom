import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useAuthStore } from '../store/authStore';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Orders Page - Order History List
 */
export default function Orders() {
  const [page, setPage] = useState(1);
  const { orders, pagination, isLoading, isError, error } = useOrders(page, 20);
  const { isAdmin } = useAuthStore();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">
        {isAdmin() ? 'All Orders' : 'Order History'}
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-lg shadow-md p-12 text-center transition-colors">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            {isAdmin() ? 'No orders found' : "You haven't placed any orders yet"}
          </p>
          {!isAdmin() && (
            <a
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
            >
              Start Shopping →
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {orders.map((order) => (
              <OrderCard key={order._id || order.orderNumber} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} orders
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

