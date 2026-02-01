// hooks/useDebounce.js
import { useRef } from 'react';

const useDebounce = (func, delay) => {
  const timeoutRef = useRef(null);

  return (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default useDebounce;