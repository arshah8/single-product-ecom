import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useEffect, useState } from 'react';
import RoleGuard from './RoleGuard';
import { performLogout } from '../utils/logout';
import CartSidebar from './CartSidebar';
import {
  FaClipboardList,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChevronDown
} from 'react-icons/fa';
import { IoCartOutline, IoWatchOutline } from 'react-icons/io5';
import { HiOutlineHeart } from 'react-icons/hi';
import { RiShareForwardBoxLine } from 'react-icons/ri';
import { SlLogin } from 'react-icons/sl';
import { RxHamburgerMenu, RxCross1 } from 'react-icons/rx';
import ThemeToggle from './ThemeToggle';

/**
 * Navigation Bar Component - Responsive with Enhanced UX
 */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isAdmin } = useAuthStore();
  const { getCartItemCount, fetchCart, shouldOpenSidebar, clearSidebarTrigger } = useCartStore();
  const { getWishlistItemCount, fetchWishlists } = useWishlistStore();
  const cartItemCount = getCartItemCount();
  const wishlistItemCount = getWishlistItemCount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  const handleLogout = async () => {
    // Clear all user data (cart, auth, SWR cache)
    await performLogout();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    // Navigate to home page
    navigate('/', { replace: true });
  };

  useEffect(() => {
    // Fetch cart on mount to get current count
    fetchCart().catch(() => {
      // Silently fail if cart fetch fails (e.g., not logged in or no cart)
    });
    // Fetch wishlists on mount to get current count
    fetchWishlists().catch(() => {
      // Silently fail if wishlist fetch fails
    });
  }, []);

  // Open cart sidebar when shouldOpenSidebar is triggered
  useEffect(() => {
    if (shouldOpenSidebar) {
      setIsCartSidebarOpen(true);
      clearSidebarTrigger();
    }
  }, [shouldOpenSidebar, clearSidebarTrigger]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, isUserMenuOpen]);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon, className = '' }) => (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive(to)
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
        } ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </Link>
  );

  const CartLink = ({ className = '' }) => (
    <button
      onClick={() => setIsCartSidebarOpen(true)}
      className={`relative flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive('/cart')
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
        } ${className}`}
    >
      <IoCartOutline className="w-5 h-5" />
      <span className="hidden sm:inline">Cart</span>
      {cartItemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {cartItemCount > 99 ? '99+' : cartItemCount}
        </span>
      )}
    </button>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
          >
            <IoWatchOutline className="w-8 h-8" />
            <span className="hidden sm:inline">Watches</span>
            <span className="sm:hidden">Watches</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <NavLink to="/" icon={IoWatchOutline}>
              Products
            </NavLink>

            <CartLink />

            <div className="relative">
              <NavLink to="/wishlist" icon={HiOutlineHeart}>
                Wishlist
              </NavLink>
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                </span>
              )}
            </div>

            <NavLink to="/track-order" icon={RiShareForwardBoxLine}>
              Track Order
            </NavLink>

            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <NavLink to="/orders" icon={FaClipboardList}>
                  Orders
                </NavLink>

                {/* User Menu Dropdown */}
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <FaUser className="w-5 h-5" />
                    <span className="max-w-[120px] truncate">
                      {user?.firstName || user?.name || 'Account'}
                    </span>
                    <FaChevronDown
                      className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 transform transition-all duration-200 ease-out origin-top-right">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <FaUser className="w-4 h-4" />
                          <span>My Profile</span>
                        </div>
                      </Link>
                      {isAdmin() && (
                        <>
                          <Link
                            to="/admin/products"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <FaCog className="w-4 h-4" />
                              <span>Products</span>
                            </div>
                          </Link>
                          <Link
                            to="/admin/categories"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <FaClipboardList className="w-4 h-4" />
                              <span>Categories</span>
                            </div>
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <FaSignOutAlt className="w-4 h-4" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <SlLogin className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <ThemeToggle />
            <CartLink className="!p-2" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <RxCross1 className="w-6 h-6" />
              ) : (
                <RxHamburgerMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 transform transition-all duration-200 ease-out">
            <div className="flex flex-col space-y-2">
              <NavLink to="/" icon={IoWatchOutline}>
                Products
              </NavLink>

              <NavLink to="/track-order" icon={RiShareForwardBoxLine}>
                Track Order
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink to="/orders" icon={FaClipboardList}>
                    Orders
                  </NavLink>
                  <Link
                    to="/profile"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive('/profile')
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                  >
                    <FaUser className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>
                  {isAdmin() && (
                    <Link
                      to="/admin/products"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive('/admin') || isActive('/admin/products')
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                    >
                      <FaCog className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md"
                  >
                    <SlLogin className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartSidebarOpen}
        onClose={() => setIsCartSidebarOpen(false)}
      />
    </nav>
  );
}

