import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useThrottle } from '../hooks/useThrottle';
import LoadingSpinner from './LoadingSpinner';
import { RiDeleteBin7Line } from 'react-icons/ri';

/**
 * Cart Item Component with Quantity Controls
 */
export default function CartItem({ item, isSidebar = false }) {
  const { updateCartItem, removeFromCart, isLoading, cart } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle both populated and unpopulated productId
  // Add safety check upfront
  if (!item || !item.productId) return null;

  const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
  const product = typeof item.productId === 'object' ? item.productId : item.product;

  // Final safety check for productId
  if (!productId) return null;

  // Get the latest item data from cart if available (prioritize cart store over prop)
  const currentItem = cart?.items?.find(i => {
    if (!i.productId) return false;
    const id = typeof i.productId === 'object' ? i.productId._id : i.productId;
    return id && productId && id.toString() === productId.toString();
  }) || item;

  // Use currentItem quantity directly - no local state needed for display
  // Only use local state for the input field to allow user editing
  const currentQuantity = currentItem?.quantity || item.quantity;
  const [localQuantity, setLocalQuantity] = useState(currentQuantity);

  // Sync local quantity with cart item when cart updates
  useEffect(() => {
    if (currentItem && currentItem.quantity !== undefined) {
      setLocalQuantity(currentItem.quantity);
    }
  }, [cart, productId]); // Depend on cart and productId to catch all updates

  // Throttle quantity updates to prevent rapid API calls
  const throttledUpdate = useThrottle(async (newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
    } else {
      setIsUpdating(true);
      try {
        const updatedCart = await updateCartItem(productId, newQuantity);
        // Update local quantity from the response
        const updatedItem = updatedCart.items.find(i => {
          if (!i.productId) return false;
          const id = typeof i.productId === 'object' ? i.productId._id : i.productId;
          return id && productId && id.toString() === productId.toString();
        });
        if (updatedItem) {
          setLocalQuantity(updatedItem.quantity);
        }
      } catch (error) {
        // Revert on error
        setLocalQuantity(currentItem.quantity);
      } finally {
        setIsUpdating(false);
      }
    }
  }, 500);

  const handleQuantityChange = (newQuantity) => {
    const maxStock = product?.stock || 999;
    const quantity = Math.max(0, Math.min(newQuantity, maxStock));
    setLocalQuantity(quantity);
    throttledUpdate(quantity);
  };

  const handleRemove = async () => {
    await removeFromCart(productId);
  };

  // Use currentQuantity for calculations (always use latest from cart store)
  // But prefer subtotal from backend if available (more accurate)
  const calculatedSubtotal = (currentItem.unitPrice || currentItem.price || 0) * currentQuantity;
  const itemTotal = (currentItem.subtotal || calculatedSubtotal).toFixed(2);
  const unitPrice = (currentItem.unitPrice || currentItem.price || 0).toFixed(2);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-md border border-transparent dark:border-gray-800 transition-all duration-200 ${isSidebar ? 'p-3 sm:p-4' : 'p-4'} flex ${isSidebar ? 'flex-col' : 'flex-row'} items-start ${isSidebar ? '' : 'items-center'} ${isSidebar ? 'gap-3' : 'gap-4'} min-w-0 w-full`}>
      {/* Product Image */}
      <Link to={`/products/${productId}`} className={`flex-shrink-0 ${isSidebar ? 'w-full h-32 sm:h-36' : 'w-20 md:w-24 h-20 md:h-24'}`}>
        {product?.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product?.name || 'Product'}
            className={`${isSidebar ? 'w-full h-32 sm:h-36' : 'w-20 md:w-24 h-20 md:h-24'} object-cover rounded-lg`}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className={`${isSidebar ? 'w-full h-32 sm:h-36' : 'w-20 md:w-24 h-20 md:h-24'} bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center`}>
            <span className="text-gray-400 dark:text-gray-500 text-xs">No Image</span>
          </div>
        )}
      </Link>

      {/* Product Details and Controls */}
      <div className={`flex-1 min-w-0 w-full ${isSidebar ? 'flex flex-col' : 'flex items-center'} ${isSidebar ? 'gap-3' : 'gap-4 lg:gap-6'}`}>
        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/products/${productId}`}
            className={`${isSidebar ? 'text-base sm:text-lg' : 'text-lg'} font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 block truncate transition-colors`}
          >
            {product?.name || 'Product'}
          </Link>
          <p className={`${isSidebar ? 'text-xs sm:text-sm' : 'text-sm'} text-gray-500 dark:text-gray-400 mt-0.5`}>{product?.category}</p>
          {isSidebar ? (
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                ${unitPrice} <span className="text-gray-400 dark:text-gray-600">×</span> {currentQuantity}
              </p>
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                ${itemTotal}
              </p>
            </div>
          ) : (
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
              ${unitPrice}
            </p>
          )}
        </div>

        {/* Quantity Controls and Remove Button */}
        <div className={`flex items-center ${isSidebar ? 'justify-between w-full' : ''} gap-3`}>
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm flex-shrink-0 transition-colors">
            <button
              onClick={() => handleQuantityChange(localQuantity - 1)}
              disabled={isLoading || isUpdating}
              className="w-9 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-semibold border-r border-gray-300 dark:border-gray-700"
              aria-label="Decrease quantity"
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <div className="w-14 text-center bg-white dark:bg-gray-800 flex items-center justify-center transition-colors">
              {isUpdating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <input
                  type="number"
                  min="0"
                  max={product?.stock || 999}
                  value={localQuantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                  className="w-full text-center bg-transparent border-0 focus:outline-none focus:ring-0 py-1.5 text-base font-medium text-gray-900 dark:text-gray-100"
                />
              )}
            </div>
            <button
              onClick={() => handleQuantityChange(localQuantity + 1)}
              disabled={isLoading || isUpdating || localQuantity >= (product?.stock || 999) || !product?.stock}
              className="w-9 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-semibold border-l border-gray-300 dark:border-gray-700"
              aria-label="Increase quantity"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="p-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/40 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center flex-shrink-0"
            aria-label="Remove item"
          >
            <RiDeleteBin7Line className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Item Total (only for non-sidebar view) */}
      {!isSidebar && (
        <div className="text-right flex-shrink-0 min-w-[80px]">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">
            ${itemTotal}
          </p>
        </div>
      )}
    </div>
  );
}

