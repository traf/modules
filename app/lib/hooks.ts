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

/**
 * Hook to detect when an element first enters the viewport
 * @param ref - Ref to the observed element
 * @param margin - Distance outside the viewport to start loading (default: 200px)
 * @returns Boolean that stays true once the element has been seen
 */
export function useVisible(ref: RefObject<HTMLElement | null>, margin: string = '200px'): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { rootMargin: margin });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin, isVisible]);

  return isVisible;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) setStored(JSON.parse(item));
    } catch {}
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored(prev => {
      const next = value instanceof Function ? value(prev) : value;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);

  return [stored, setValue];
}
