import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for infinite scroll
 * Triggers callback when user scrolls near bottom of page
 */
export function useInfiniteScroll(callback, hasMore = true, isLoading = false) {
  const observerRef = useRef(null);
  const elementRef = useRef(null);

  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [callback, hasMore, isLoading]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { lastElementRef, elementRef };
}

