import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useCart } from '../hooks/useCart';
import CartItem from './CartItem';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { IoCartOutline } from 'react-icons/io5';
import { RxCross1 } from 'react-icons/rx';

/**
 * Cart Sidebar Component
 * Slides in from the right to show cart contents
 */
export default function CartSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cart: storeCart, fetchCart } = useCartStore();
  const { cart: swrCart, isLoading, isError, error, mutate } = useCart();

  // Use SWR cart if available, otherwise use store cart
  const cart = swrCart || storeCart;

  // Fetch cart when sidebar opens
  useEffect(() => {
    if (isOpen) {
      fetchCart()
        .then(() => {
          mutate();
        })
        .catch(() => {
          // Silently fail
        });
    }
  }, [isOpen, fetchCart, mutate]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  const subtotal = cart?.total || cart?.subtotal || (cart?.items?.reduce((sum, item) => {
    return sum + (item.subtotal || (item.unitPrice || item.price || 0) * item.quantity);
  }, 0) || 0);

  // Calculate unique items count (deduplicate by productId)
  const getUniqueItemsCount = () => {
    if (!cart?.items || cart.items.length === 0) return 0;
    const seenProductIds = new Set();
    cart.items.forEach((item) => {
      // Add safety check for item.productId
      if (!item.productId) return;

      const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
      if (productId) {
        seenProductIds.add(productId.toString());
      }
    });
    return seenProductIds.size;
  };

  const uniqueItemsCount = getUniqueItemsCount();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-full sm:w-96 md:w-[28rem] lg:max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden border-l border-transparent dark:border-gray-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <IoCartOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  Shopping Cart
                </h2>
                {uniqueItemsCount > 0 && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {uniqueItemsCount} {uniqueItemsCount === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-2 p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              aria-label="Close cart"
            >
              <RxCross1 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : isError ? (
              <div className="p-4">
                <ErrorMessage error={error} onRetry={() => mutate()} />
              </div>
            ) : !cart || !cart.items || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 p-4 sm:p-6 text-center">
                <IoCartOutline className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-2">Your cart is empty</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Add some products to get started!</p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {(() => {
                  // Deduplicate items by productId (in case backend somehow returns duplicates)
                  const seenProductIds = new Set();
                  const uniqueItems = cart.items.filter((item) => {
                    // Safety check
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
                    const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
                    return (
                      <CartItem key={productId} item={item} isSidebar={true} />
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Footer with Summary and Actions */}
          {cart && cart.items && cart.items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
              <div className="mb-3 sm:mb-4">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">Subtotal:</span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                  Shipping and taxes calculated at checkout
                </p>
              </div>
              <div className="space-y-2 sm:space-y-2.5">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm sm:text-base"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={handleViewCart}
                  className="w-full bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 py-2 sm:py-2.5 px-4 sm:px-6 rounded-md border border-blue-600 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/40 transition-colors font-medium text-sm sm:text-base"
                >
                  View Full Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

