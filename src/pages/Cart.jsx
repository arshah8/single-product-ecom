import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/CartItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Cart Page
 */
export default function Cart() {
  const navigate = useNavigate();
  const { cart, isLoading, isError, error, mutate } = useCart();
  const { cart: storeCart, fetchCart } = useCartStore();

  useEffect(() => {
    // Fetch cart to ensure it's up to date
    fetchCart()
      .then(() => {
        // Refresh SWR cache after fetching
        mutate();
      })
      .catch(() => {
        // Silently fail if cart fetch fails
      });
  }, [fetchCart, mutate]);

  // Use storeCart if useCart returns undefined/empty
  // Prefer storeCart as it's updated immediately when items change
  const displayCart = storeCart || cart;

  // Refresh SWR cache when storeCart changes
  useEffect(() => {
    if (storeCart) {
      mutate(storeCart, false); // Update SWR cache without revalidating
    }
  }, [storeCart, mutate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage error={error} onRetry={() => mutate()} />
      </div>
    );
  }

  if (!displayCart || !displayCart.items || displayCart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">Shopping Cart</h1>
        <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-lg shadow-md p-12 text-center transition-colors">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Your cart is empty</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {(() => {
            // Deduplicate items by productId (in case backend somehow returns duplicates)
            const seenProductIds = new Set();
            const uniqueItems = displayCart.items.filter((item) => {
              if (!item.productId) return false;
              const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
              if (!productId) return false;

              const productIdStr = productId.toString();
              if (seenProductIds.has(productIdStr)) {
                return false; // Skip duplicate
              }
              seenProductIds.add(productIdStr);
              return true;
            });

            return uniqueItems.map((item) => {
              // Handle both populated and unpopulated productId
              const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
              return (
                <CartItem key={productId} item={item} isSidebar={true} />
              );
            });
          })()}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 lg:h-full">
          <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-lg shadow-md p-6 sticky top-4 flex flex-col lg:h-full transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Order Summary</h2>

            <div className="flex-1 space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${(displayCart.total || displayCart.subtotal || displayCart.items?.reduce((sum, item) => {
                  return sum + (item.subtotal || (item.unitPrice || item.price || 0) * item.quantity);
                }, 0) || 0).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span>${(displayCart.total || displayCart.subtotal || displayCart.items?.reduce((sum, item) => {
                  return sum + (item.subtotal || (item.unitPrice || item.price || 0) * item.quantity);
                }, 0) || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (displayCart.items && displayCart.items.length > 0) {
                    navigate('/checkout');
                  }
                }}
                disabled={!displayCart.items || displayCart.items.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/"
                className="block text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

