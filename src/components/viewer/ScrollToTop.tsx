'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down
      if (window.scrollY > 800) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    // To go to the absolute top of the webpage (where both headers are visible),
    // we MUST use window.scrollTo(0, 0) AND behavior: 'auto' (instant).
    // Using behavior: 'smooth' will break and cancel halfway due to react-virtuoso
    // dynamically unloading items and changing the document height during the scroll.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-900/20 transition-all hover:scale-105 hover:bg-violet-500 active:scale-95"
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-3 w-3" />
    </button>
  );
}
