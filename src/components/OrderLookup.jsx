import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useOrderTracking } from '../hooks/useOrders';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

/**
 * Order Lookup Component
 * Allows guests to lookup orders by order number using the public tracking endpoint
 */
export default function OrderLookup() {
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState(null);
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    orderNumber: Yup.string()
      .matches(
        /^ORD-\d{4}-\d{6}$/,
        'Invalid format. Expected: ORD-YYYY-000000 (e.g., ORD-2024-000001)'
      )
      .required('Order number is required'),
  });

  const formik = useFormik({
    initialValues: {
      orderNumber: '',
    },
    validationSchema,
    onSubmit: (values) => {
      setSubmittedOrderNumber(values.orderNumber.trim());
    },
  });

  const { tracking, isLoading, isError, error } = useOrderTracking(submittedOrderNumber);

  const handleViewDetails = () => {
    if (tracking?.orderNumber) {
      navigate(`/orders/${tracking.orderNumber}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 sm:p-8 border border-transparent dark:border-gray-800 transition-colors duration-200">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Track Your Order</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Enter your order number to track your order status
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order Number
            </label>
            <input
              id="orderNumber"
              name="orderNumber"
              type="text"
              {...formik.getFieldProps('orderNumber')}
              className={`w-full px-3 py-2 border rounded-md outline-none transition-colors dark:bg-gray-800 dark:text-gray-200 ${formik.touched.orderNumber && formik.errors.orderNumber
                ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-blue-500'
                }`}
              placeholder="e.g., ORD-2024-000001"
            />
            {formik.touched.orderNumber && formik.errors.orderNumber && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.orderNumber}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Looking up...
              </span>
            ) : (
              'Track Order'
            )}
          </button>
        </form>

        {submittedOrderNumber && (
          <div className="mt-6">
            {isError ? (
              <ErrorMessage
                error={error?.status === 404 ? 'Order not found' : error?.message || 'Failed to lookup order'}
              />
            ) : tracking ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Order #{tracking.orderNumber}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${tracking.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : tracking.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : tracking.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {tracking.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Current Status: {tracking.status?.charAt(0).toUpperCase() + tracking.status?.slice(1)}
                </p>
                <button
                  onClick={handleViewDetails}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  View Full Details
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

