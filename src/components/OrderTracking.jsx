/**
 * Order Tracking Component
 * Displays order status timeline with visual indicators
 */
export default function OrderTracking({ order }) {
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📦' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ];

  const cancelledStatus = { key: 'cancelled', label: 'Cancelled', icon: '❌' };

  const getCurrentStepIndex = () => {
    if (order.orderStatus === 'cancelled') return -1;
    return statusSteps.findIndex((step) => step.key === order.orderStatus);
  };

  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-transparent dark:border-gray-800 transition-colors">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">Order Status</h3>

      {isCancelled ? (
        <div className="flex items-center space-x-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors">
          <span className="text-2xl">{cancelledStatus.icon}</span>
          <div>
            <p className="font-semibold text-red-900 dark:text-red-400">{cancelledStatus.label}</p>
            <p className="text-sm text-red-700 dark:text-red-300">This order has been cancelled</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 transition-colors"></div>

          {/* Status Steps */}
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="relative flex items-start">
                  {/* Status Icon */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${isCompleted
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                      }`}
                  >
                    <span className="text-lg">{step.icon}</span>
                  </div>

                  {/* Status Label */}
                  <div className="ml-4 flex-1 pt-2">
                    <p
                      className={`font-medium transition-colors ${isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
                        }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 transition-colors">Current status</p>
                    )}
                    {isCompleted && !isCurrent && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Completed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(order.shippedAt || order.deliveredAt || order.cancelledAt) && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Timeline</h4>
          {order.shippedAt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
              Shipped on: {new Date(order.shippedAt).toLocaleDateString()}
            </p>
          )}
          {order.deliveredAt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
              Delivered on: {new Date(order.deliveredAt).toLocaleDateString()}
            </p>
          )}
          {order.cancelledAt && (
            <p className="text-sm text-red-600 dark:text-red-400 transition-colors">
              Cancelled on: {new Date(order.cancelledAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

