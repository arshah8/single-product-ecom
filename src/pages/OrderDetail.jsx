import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useOrder } from '../hooks/useOrders';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import OrderTracking from '../components/OrderTracking';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Order Detail Page
 * Displays full order details including items, addresses, payment info, and tracking
 */
export default function OrderDetail() {
  const { orderNumber } = useParams();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { order, isLoading, isError, error, mutate } = useOrder(orderNumber);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=/orders/${orderNumber}`} replace />;
  }

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
        <ErrorMessage error={error?.status === 404 ? 'Order not found' : error} />
        <div className="mt-4">
          <Link to="/orders" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = async (newStatus) => {
    if (!isAdmin()) return;

    setIsUpdatingStatus(true);
    setStatusError(null);

    try {
      await api.updateOrderStatus(orderNumber, newStatus);
      // Refresh order data
      mutate();
    } catch (err) {
      setStatusError(err.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/orders" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 inline-block transition-colors">
          ← Back to Orders
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Order #{order.orderNumber}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-transparent dark:border-gray-800 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center border-b border-gray-200 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.productName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unit Price: ${item.unitPrice?.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      ${((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-transparent dark:border-gray-800 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Shipping Address</h2>
              <div className="text-gray-600 dark:text-gray-400">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-transparent dark:border-gray-800 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Billing Address</h2>
              <div className="text-gray-600 dark:text-gray-400">
                <p>{order.billingAddress.street}</p>
                <p>
                  {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                </p>
                <p>{order.billingAddress.country}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Status (Admin Only) */}
          {isAdmin() && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-transparent dark:border-gray-800 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Order Status</h2>
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                </span>
              </div>

              {statusError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
                  {statusError}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Change Status:
                </label>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdatingStatus}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                {isUpdatingStatus && (
                  <div className="flex items-center text-sm text-gray-600">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating status...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Tracking */}
          <OrderTracking order={order} />

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-transparent dark:border-gray-800 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>${order.shippingCost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span>${order.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Payment Method</h3>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {order.paymentMethod?.replace('_', ' ') || 'N/A'}
              </p>
              {order.paymentStatus && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Status: <span className="capitalize">{order.paymentStatus}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

