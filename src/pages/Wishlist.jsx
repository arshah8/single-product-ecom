import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useWishlist } from '../hooks/useWishlist';
import { useCartStore } from '../store/cartStore';
import WishlistButton from '../components/WishlistButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import toast from 'react-hot-toast';
import { HiHeart, HiOutlineHeart, HiPlus } from 'react-icons/hi';
import { IoBagOutline } from 'react-icons/io5';

/**
 * Wishlist Page Component
 * Displays user's wishlists with ability to manage multiple wishlists
 */
export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { wishlists, isLoading, isError, error, mutate } = useWishlist();
  const { fetchCart, triggerSidebarOpen } = useCartStore();
  const { addToCart: addWishlistToCart, isLoading: isAddingToCart, setActiveWishlistId } = useWishlistStore();
  const [selectedWishlistId, setSelectedWishlistId] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const { createWishlist, deleteWishlist, updateWishlist, isLoading: isWishlistLoading } = useWishlistStore();

  // Set default wishlist when wishlists load
  useEffect(() => {
    if (wishlists && wishlists.length > 0 && !selectedWishlistId) {
      const defaultWishlist = wishlists.find(w => w.isDefault) || wishlists[0];
      setSelectedWishlistId(defaultWishlist._id);
    }
  }, [wishlists, selectedWishlistId]);

  const currentWishlist = wishlists?.find(w => w._id === selectedWishlistId) || wishlists?.[0];

  // Keep global "active wishlist" in sync so product pages add to the currently selected wishlist
  useEffect(() => {
    if (selectedWishlistId) {
      setActiveWishlistId(selectedWishlistId);
    }
  }, [selectedWishlistId, setActiveWishlistId]);

  const handleCreateWishlist = async (e) => {
    e.preventDefault();
    if (!newWishlistName.trim()) return;

    try {
      const newWishlist = await createWishlist(newWishlistName.trim());
      setSelectedWishlistId(newWishlist._id);
      setActiveWishlistId(newWishlist._id);
      setShowCreateModal(false);
      setNewWishlistName('');
      mutate();
      toast.success('Wishlist created');
    } catch (error) {
      console.error('Failed to create wishlist:', error);
      toast.error(error.message || 'Failed to create wishlist. Please try again.');
    }
  };

  const handleDeleteWishlist = async (wishlistId) => {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      await deleteWishlist(wishlistId);
      if (selectedWishlistId === wishlistId) {
        const remaining = wishlists.filter(w => w._id !== wishlistId);
        setSelectedWishlistId(remaining[0]?._id || null);
      }
      mutate();
      toast.success('Wishlist deleted');
    } catch (error) {
      console.error('Failed to delete wishlist:', error);
      toast.error(error.message || 'Failed to delete wishlist. Please try again.');
    }
  };

  const handleToggleProductSelection = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleAddToCart = async (productIds = null) => {
    if (!currentWishlist) return;

    const productsToAdd = productIds || Array.from(selectedProducts);
    if (productsToAdd.length === 0) {
      toast.error('Please select products to add to cart');
      return;
    }

    try {
      const result = await addWishlistToCart(currentWishlist._id, productsToAdd);
      await fetchCart(); // Refresh cart
      setSelectedProducts(new Set()); // Clear selection
      triggerSidebarOpen();
      toast.success(
        `Added ${result.itemsAdded} item(s) to cart${result.itemsSkipped > 0 ? ` (${result.itemsSkipped} skipped - out of stock)` : ''}`
      );
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error(error.message || 'Failed to add items to cart. Please try again.');
    }
  };

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
        <ErrorMessage error={error} />
      </div>
    );
  }

  const products = currentWishlist?.products || currentWishlist?.productIds || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">My Wishlists</h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <HiPlus className="w-5 h-5" />
            <span>New Wishlist</span>
          </button>
        )}
      </div>

      {/* Wishlist Selector (for authenticated users with multiple wishlists) */}
      {isAuthenticated && wishlists && wishlists.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Wishlist:
          </label>
          <div className="flex flex-wrap gap-2">
            {wishlists.map((w) => (
              <button
                key={w._id}
                onClick={() => setSelectedWishlistId(w._id)}
                className={`px-4 py-2 rounded-md transition-colors ${selectedWishlistId === w._id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {w.name} ({w.productIds?.length || 0}/50)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Wishlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full border border-transparent dark:border-gray-800 shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Create New Wishlist</h2>
            <form onSubmit={handleCreateWishlist}>
              <input
                type="text"
                value={newWishlistName}
                onChange={(e) => setNewWishlistName(e.target.value)}
                placeholder="Wishlist name (e.g., Gift Ideas)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-md mb-4 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                maxLength={100}
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewWishlistName('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWishlistLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wishlist Content */}
      {!currentWishlist || products.length === 0 ? (
        <div className="text-center py-12">
          <HiOutlineHeart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Your wishlist is empty</p>
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center space-x-2"
          >
            <IoBagOutline className="w-5 h-5" />
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Bulk Actions */}
          {products.length > 0 && (
            <div className="mb-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-transparent dark:border-gray-700 transition-colors">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleAddToCart()}
                  disabled={isAddingToCart || selectedProducts.size === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <IoBagOutline className="w-5 h-5" />
                  <span>
                    {selectedProducts.size > 0
                      ? `Add ${selectedProducts.size} Selected to Cart`
                      : 'Add All to Cart'}
                  </span>
                </button>
                {selectedProducts.size > 0 && (
                  <button
                    onClick={() => setSelectedProducts(new Set())}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {products.length}/50 products
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              if (!product) return null;

              const productData =
                product && typeof product === 'object' && product._id ? product : { _id: product };

              if (!productData?._id) return null;

              const productId = productData._id.toString();
              const numericPrice = Number(productData.price);
              const displayPrice = Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : '0.00';

              return (
                <div
                  key={productId}
                  className="relative bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-transparent dark:border-gray-800"
                >
                  <div className="relative">
                    <Link to={`/products/${productId}`}>
                      {productData.images?.[0] ? (
                        <img
                          src={productData.images[0]}
                          alt={productData.name || 'Product'}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-400 dark:text-gray-500">No Image</span>
                        </div>
                      )}
                    </Link>
                    <div className="absolute top-2 right-2">
                      <WishlistButton productId={productId} wishlistId={currentWishlist._id} />
                    </div>
                    {selectedProducts.has(productId) && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Link to={`/products/${productId}`}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {productData.name || 'Product'}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        ${displayPrice}
                      </span>
                      {productData.stock !== undefined && (
                        <span className={`text-sm ${productData.isAvailable && productData.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {productData.isAvailable && productData.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(productId)}
                        onChange={() => handleToggleProductSelection(productId)}
                        className="w-4 h-4 text-blue-600 rounded dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500"
                      />
                      <label className="text-sm text-gray-600 dark:text-gray-400">Select for cart</label>
                    </div>
                    <button
                      onClick={() => handleAddToCart([productId])}
                      disabled={isAddingToCart || (productData.stock !== undefined && (!productData.isAvailable || productData.stock === 0))}
                      className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      <IoBagOutline className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}




