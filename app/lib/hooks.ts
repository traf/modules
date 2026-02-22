import { useEffect, useState, useCallback, RefObject } from 'react';

/**
 * Hook to detect if an element has been scrolled
 * @param ref - Ref to the scrollable element
 * @param threshold - Scroll threshold to trigger (default: 0)
 * @returns Boolean indicating if element is scrolled past threshold
 */
export function useScrolled(ref: RefObject<HTMLElement | null>, threshold: number = 0): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    setIsScrolled(false);

    const handleScroll = () => {
      setIsScrolled(element.scrollTop > threshold);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [ref, threshold]);

  return isScrolled;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored(prev => {
      const next = value instanceof Function ? value(prev) : value;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);

  return [stored, setValue];
}
