import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useWishlist } from '../hooks/useWishlist';
import toast from 'react-hot-toast';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import LoadingSpinner from './LoadingSpinner';

/**
 * WishlistButton Component
 * Toggle button to add/remove products from wishlist
 */
export default function WishlistButton({ productId, wishlistId = null, className = '' }) {
  const { isAuthenticated } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isProductInWishlist, isLoading, activeWishlistId } = useWishlistStore();
  const { wishlists, wishlist, mutate } = useWishlist(wishlistId);
  
  // Determine which wishlist to use (default or specified)
  const targetWishlist = wishlistId
    ? wishlist
    : (wishlists && wishlists.length > 0
        ? (wishlists.find(w => w._id === activeWishlistId) || wishlists.find(w => w.isDefault) || wishlists[0])
        : null);
  
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    if (targetWishlist && targetWishlist.productIds) {
      const productIdStr = productId.toString();
      const found = targetWishlist.productIds.some(id => {
        const idStr = typeof id === 'object' ? id._id || id.toString() : id.toString();
        return idStr === productIdStr;
      });
      setIsInWishlist(found);
    } else {
      // Fallback to store check
      setIsInWishlist(isProductInWishlist(productId));
    }
  }, [targetWishlist, productId, isProductInWishlist]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated && !targetWishlist) {
      // For guests, we need to ensure wishlist exists first
      // This will be handled by the API
    }
    
    setIsToggling(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const wishlistToUse = wishlistId || activeWishlistId || (targetWishlist?._id);
        if (wishlistToUse) {
          await removeFromWishlist(wishlistToUse, productId);
          setIsInWishlist(false);
          mutate(); // Refresh SWR cache
        }
      } else {
        // Add to wishlist
        const wishlistToUse = wishlistId || activeWishlistId || (targetWishlist?._id);
        await addToWishlist(productId, wishlistToUse);
        setIsInWishlist(true);
        mutate(); // Refresh SWR cache
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error(error.message || 'Failed to update wishlist. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling || isLoading}
      className={`p-2 rounded-full transition-colors ${
        isInWishlist
          ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isToggling ? (
        <LoadingSpinner size="sm" />
      ) : isInWishlist ? (
        <HiHeart className="w-5 h-5" />
      ) : (
        <HiOutlineHeart className="w-5 h-5" />
      )}
    </button>
  );
}




