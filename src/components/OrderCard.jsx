import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { IoEyeOutline } from 'react-icons/io5';

/**
 * Order Card Component
 * Displays a summary of an order in a card format
 */
export default function OrderCard({ order }) {
  const { isAdmin } = useAuthStore();

  const getStatusColor = (orderStatus) => {
    switch (orderStatus) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Placed on {formatDate(order.createdAt)}
            </p>
            {isAdmin() && order.customerId && typeof order.customerId === 'object' && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Customer: {order.customerId.firstName} {order.customerId.lastName} ({order.customerId.email})
              </p>
            )}
          </div>
          <div className="mt-2 sm:mt-0">
            <span
              className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                order.orderStatus
              )}`}
            >
              {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            ${order.total?.toFixed(2) || '0.00'}
          </div>
        </div>

        {order.shippingAddress && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            Shipping to: {order.shippingAddress.city}, {order.shippingAddress.country || order.shippingAddress.state}
          </div>
        )}

        <div className="flex items-center justify-end">
          <Link
            to={`/orders/${order.orderNumber}`}
            className="p-2 text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors flex items-center space-x-2 text-sm font-semibold"
            title="View full order details"
          >
            <span>View Details</span>
            <IoEyeOutline className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

