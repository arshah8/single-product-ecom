/**
 * Payment Method Selector Component
 */
export default function PaymentMethodSelector({ selectedMethod, onSelect, errors = {} }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Payment Method</h3>

      <div className="space-y-3">
        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedMethod === 'stripe'
          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-500'
          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="stripe"
            checked={selectedMethod === 'stripe'}
            onChange={(e) => onSelect(e.target.value)}
            className="mr-3 w-4 h-4 text-blue-600 dark:bg-gray-800 dark:border-gray-700"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">Credit/Debit Card</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pay securely with Stripe</div>
          </div>
          <div className="text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
            </svg>
          </div>
        </label>

        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedMethod === 'cash_on_delivery'
          ? 'border-green-600 bg-green-50/50 dark:bg-green-900/20 dark:border-green-500'
          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="cash_on_delivery"
            checked={selectedMethod === 'cash_on_delivery'}
            onChange={(e) => onSelect(e.target.value)}
            className="mr-3 w-4 h-4 text-green-600 dark:bg-gray-800 dark:border-gray-700"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">Cash on Delivery</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pay when you receive your order</div>
          </div>
          <div className="text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </label>
      </div>

      {errors.paymentMethod && (
        <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>
      )}
    </div>
  );
}


