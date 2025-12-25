/**
 * Throttle utility function
 * Limits function execution to at most once per wait time
 */
export function throttle(func, wait) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
  };
}

