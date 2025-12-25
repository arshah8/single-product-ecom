/**
 * Order Summary Component
 */
export default function OrderSummary({ cart, shippingCost = 0 }) {
  // Calculate subtotal from cart total or sum of items
  const subtotal = cart?.total || cart?.subtotal || (cart?.items?.reduce((sum, item) => {
    return sum + (item.subtotal || (item.unitPrice || item.price || 0) * item.quantity);
  }, 0) || 0);
  // Only add shipping if it's provided (from checkout session)
  const total = shippingCost > 0 ? subtotal + shippingCost : subtotal;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-transparent dark:border-gray-800 p-6 sticky top-4 transition-colors">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Order Summary</h3>

      {/* Cart Items */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {cart?.items?.map((item) => {
          // Handle both populated and unpopulated productId
          const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
          const product = typeof item.productId === 'object' ? item.productId : item.product;
          const unitPrice = item.unitPrice || item.price || 0;
          const itemTotal = item.subtotal || (unitPrice * item.quantity);

          return (
            <div key={productId} className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors">{product?.name || 'Product'}</p>
                <p className="text-gray-500 dark:text-gray-400 transition-colors">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors">
                ${itemTotal.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2 transition-colors">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span className="dark:text-gray-200">${subtotal.toFixed(2)}</span>
        </div>
        {shippingCost > 0 && (
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Shipping</span>
            <span className="dark:text-gray-200">${shippingCost.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}


