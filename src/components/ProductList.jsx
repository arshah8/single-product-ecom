import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import SortDropdown from './SortDropdown';

/**
 * Product List Component with Infinite Scroll
 */
export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);

  // The filters are derived directly from URL to ensure single source of truth
  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') || '',
    sort: searchParams.get('sort') || '',
  };

  const { products, pagination, isLoading, isError, error, mutate } = useProducts({
    ...filters,
    page,
    limit: 12,
  });

  const prevProductsIdsRef = useRef('');
  const prevPageRef = useRef(1);
  const prevFiltersRef = useRef(JSON.stringify(filters));

  // Reset to page 1 and clear products when filters change
  useEffect(() => {
    const currentFiltersStr = JSON.stringify(filters);
    if (currentFiltersStr !== prevFiltersRef.current) {
      setPage(1);
      setAllProducts([]);
      prevPageRef.current = 1;
      prevProductsIdsRef.current = '';
      prevFiltersRef.current = currentFiltersStr;
    }
  }, [filters]);

  // Accumulate products for infinite scroll
  useEffect(() => {
    if (!products || (products.length === 0 && !isLoading)) return;
    if (products.length === 0) return;

    // Ensure we're not adding products from a stale filter set
    const currentFiltersStr = JSON.stringify(filters);
    if (currentFiltersStr !== prevFiltersRef.current) return;

    if (page === 1) {
      setAllProducts(products);
      prevProductsIdsRef.current = products.map(p => p._id).join(',');
      prevPageRef.current = 1;
    } else {
      const currentProductsIds = products.map(p => p._id).join(',');
      const productsChanged = currentProductsIds !== prevProductsIdsRef.current;

      if (productsChanged) {
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map(p => p._id));
          const newProducts = products.filter(p => !existingIds.has(p._id));
          return [...prev, ...newProducts];
        });
        prevProductsIdsRef.current = currentProductsIds;
        prevPageRef.current = page;
      }
    }
  }, [products, page, filters, isLoading]);

  const handleSearch = useCallback((searchTerm) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (searchTerm) {
        newParams.set('search', searchTerm);
      } else {
        newParams.delete('search');
      }
      return newParams;
    });
  }, [setSearchParams]);

  const handleFilterChange = useCallback((newFilters) => {
    // Update URL params
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      return newParams;
    });
  }, [setSearchParams]);

  const loadMore = () => {
    if (pagination && page < pagination.totalPages && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  const { lastElementRef } = useInfiniteScroll(
    loadMore,
    pagination ? page < pagination.totalPages : false,
    isLoading
  );

  // Extract unique categories from products (in a real app, this would come from an API)
  const categories = Array.from(new Set(allProducts.map((p) => p.category)));

  if (isError && page === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage error={error} onRetry={() => mutate()} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors duration-200">Products</h1>

        {/* Search and Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <SortDropdown />
        </div>

        {/* Filters and Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterBar categories={categories} onFilterChange={handleFilterChange} />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading && page === 1 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : allProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No products found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {allProducts.map((product, index) => (
                    <div
                      key={product._id}
                      ref={index === allProducts.length - 1 ? lastElementRef : null}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Loading indicator for infinite scroll */}
                {isLoading && page > 1 && (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                )}

                {/* End of results message */}
                {pagination && page >= pagination.totalPages && allProducts.length > 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No more products to load</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
