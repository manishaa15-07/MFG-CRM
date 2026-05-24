'use client';

import { useState, useEffect } from 'react';

/**
 * Debounce a value by a specified delay (in milliseconds).
 *
 * Useful for search inputs where you want to wait for the user
 * to stop typing before triggering an API call.
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 400);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
