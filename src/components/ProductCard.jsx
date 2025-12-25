import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { RiDeleteBin7Line } from 'react-icons/ri';
import WishlistButton from './WishlistButton';
import { getImageUrl } from '../services/api';

/**
 * Product Card Component
 * Displays product information in a card format
 */
export default function ProductCard({ product, onEdit, onDelete, isDeleting = false }) {
  const { _id, name, price, images, category, stock, isAvailable } = product;
  const { isAdmin } = useAuthStore();

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(product);
    } else {
      // Navigate to admin products page - the admin page will handle editing
      window.location.href = '/admin/products';
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(_id);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-transparent dark:border-gray-800">
      <Link
        to={`/products/${_id}`}
        className="block"
      >
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-800 relative">
          {images?.[0] ? (
            <img
              src={getImageUrl(images[0])}
              alt={name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500 text-sm">No Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton productId={_id} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
              {name}
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{category}</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              ${price.toFixed(2)}
            </span>
            {!isAvailable || stock === 0 ? (
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            ) : (
              <span className="text-sm text-green-600 font-medium">In Stock</span>
            )}
          </div>
        </div>
      </Link>

      {isAdmin() && (onEdit || onDelete) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 px-4 pb-4 flex justify-end space-x-2">
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg transition-colors"
              title="Edit Product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete Product"
            >
              {isDeleting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <RiDeleteBin7Line className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

