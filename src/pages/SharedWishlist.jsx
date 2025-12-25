import { useParams } from 'react-router-dom';
import { useSharedWishlist } from '../hooks/useWishlist';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { HiOutlineHeart } from 'react-icons/hi';
import { Link } from 'react-router-dom';

/**
 * SharedWishlist Page Component
 * Displays a shared wishlist (read-only) by share token
 */
export default function SharedWishlist() {
  const { shareToken } = useParams();
  const { wishlist, isLoading, isError, error } = useSharedWishlist(shareToken);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError || !wishlist) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage error={error || new Error('Shared wishlist not found')} />
        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const products = wishlist.products || wishlist.productIds || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{wishlist.name}</h1>
        <p className="text-gray-600 mt-2">Shared Wishlist</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <HiOutlineHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">This wishlist is empty</p>
        </div>
      ) : (
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
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
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
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </Link>
                </div>
                <div className="p-4">
                  <Link to={`/products/${productId}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {productData.name || 'Product'}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      ${displayPrice}
                    </span>
                    {productData.stock !== undefined && (
                      <span className={`text-sm ${productData.isAvailable && productData.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {productData.isAvailable && productData.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}




