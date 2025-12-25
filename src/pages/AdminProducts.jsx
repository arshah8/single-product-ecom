import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ProductForm from '../components/ProductForm';

/**
 * Admin Products Management Page
 */
export default function AdminProducts() {
  const { isAdmin } = useAuthStore();
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);

  const { data, error, isLoading, mutate } = useSWR(
    `/products?page=${page}&limit=20`,
    () => api.getProducts({ page, limit: 20 })
  );

  const products = data?.products || [];
  const pagination = data?.pagination;

  // Infinite Scroll Logic
  const prevProductsIdsRef = useRef('');
  const prevPageRef = useRef(1);

  useEffect(() => {
    const currentProductsIds = products.map(p => p._id).join(',');
    const productsChanged = currentProductsIds !== prevProductsIdsRef.current;

    // If page 1, reset/overwrite. If > 1, append if changed.
    if (page === 1) {
      if (productsChanged) {
        setAllProducts(products);
        prevProductsIdsRef.current = currentProductsIds;
      }
    } else {
      if (productsChanged && products.length > 0) {
        setAllProducts(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const newProducts = products.filter(p => !existingIds.has(p._id));
          return [...prev, ...newProducts];
        });
        prevProductsIdsRef.current = currentProductsIds;
      }
    }
  }, [products, page]);

  const loadMore = useCallback(() => {
    if (pagination && page < pagination.totalPages && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [pagination, page, isLoading]);

  const { lastElementRef } = useInfiniteScroll(
    loadMore,
    pagination ? page < pagination.totalPages : false,
    isLoading
  );

  // CRUD State
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setIsDeleting(productId);
    try {
      await api.deleteProduct(productId);
      // Remove from local state immediately
      setAllProducts(prev => prev.filter(p => p._id !== productId));
      mutate(); // Refresh via SWR (might not update all pages, but updates current view)
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    setPage(1); // Reset to page 1 to refresh list
    mutate();
  };

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage error="Access denied. Admin privileges required." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Product Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {isLoading && page === 1 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error && page === 1 ? (
        <ErrorMessage error={error} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {allProducts.map((product, index) => (
              <div
                key={product._id}
                ref={index === allProducts.length - 1 ? lastElementRef : null}
              >
                <ProductCard
                  product={product}
                  onEdit={handleEdit}
                  onDelete={(productId) => handleDelete(productId)}
                  isDeleting={isDeleting === product._id}
                />
              </div>
            ))}
          </div>

          {/* Loading indicator for next pages */}
          {isLoading && page > 1 && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {allProducts.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-transparent dark:border-gray-700 transition-colors">
              <p className="text-gray-500 dark:text-gray-400">No products found. Add your first product!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
