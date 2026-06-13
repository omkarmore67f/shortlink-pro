import { useState, useEffect } from 'react';

/**
 * useDebounce
 *
 * Returns a debounced copy of `value` that only updates after `delay`
 * ms have passed without changes. Used for the search input so we
 * don't fire an API request on every keystroke.
 */
export const useDebounce = <T>(value: T, delay = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
