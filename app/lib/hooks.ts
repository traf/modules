import { useEffect, useState, RefObject } from 'react';

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
