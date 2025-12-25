import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import ProfileForm from '../components/ProfileForm';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import useSWR from 'swr';

const fetcher = (url) => {
  return api.getOrderHistory(1, 10);
};

/**
 * Profile Page with Order History
 */
export default function Profile() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: orders, error, isLoading } = useSWR(
    activeTab === 'orders' ? '/users/me/orders' : null,
    fetcher
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">My Account</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Order History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 border border-transparent dark:border-gray-800 transition-colors">
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-display transition-colors">Profile Information</h2>
            <ProfileForm />
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-display transition-colors">Order History</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <ErrorMessage error={error} />
            ) : orders?.orders?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-12">No orders found</p>
            ) : (
              <div className="space-y-4">
                {orders?.orders?.map((order) => (
                  <OrderCard key={order._id || order.orderNumber} order={order} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

