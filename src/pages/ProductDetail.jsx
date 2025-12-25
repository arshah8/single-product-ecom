import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../hooks/useProduct';
import { useCartStore } from '../store/cartStore';
import { useCart } from '../hooks/useCart';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import WishlistButton from '../components/WishlistButton';
import toast from 'react-hot-toast';
import { getImageUrl } from '../services/api';

/**
 * Product Detail Page
 */
export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { product, isLoading, isError, error } = useProduct(productId);
  const { addToCart, isLoading: isAddingToCart, fetchCart } = useCartStore();
  const { mutate: mutateCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddToCart = async () => {
    try {
      const updatedCart = await addToCart(productId, quantity);
      // The cart store is already updated by addToCart, but refresh to ensure consistency
      await fetchCart();
      // Also update SWR cache
      mutateCart(updatedCart, false);
      setSuccessMessage('Product added to cart!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add product to cart. Please try again.');
    }
  };

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
        <ErrorMessage error={error} onRetry={() => navigate('/')} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center space-x-2"
      >
        <span>← Back to Products</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-lg shadow-md p-8 transition-colors">
        {/* Product Images */}
        <div>
          {product.images?.[0] ? (
            <img
              src={getImageUrl(product.images[0])}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-lg">No Image Available</span>
            </div>
          )}
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.slice(1, 5).map((image, index) => (
                <img
                  key={index}
                  src={getImageUrl(image)}
                  alt={`${product.name} ${index + 2}`}
                  className="w-full h-20 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">{product.name}</h1>
            <WishlistButton productId={productId} />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{product.category}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">
            ${product.price.toFixed(2)}
          </p>

          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">{product.description}</p>
            <div className="flex items-center space-x-4">
              <span className={`font-medium ${product.isAvailable && product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {product.isAvailable && product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.stock > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {product.stock} available
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart */}
          {product.isAvailable && product.stock > 0 ? (
            <div className="space-y-4">
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                  {successMessage}
                </div>
              )}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full bg-gray-400 text-white py-3 px-6 rounded-md cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

