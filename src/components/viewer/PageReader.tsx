'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

interface PageReaderProps {
  pageImageUrls: string[];
  manhwaId: string;
  chapterId: string;
}

export function PageReader({ pageImageUrls, manhwaId, chapterId }: PageReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Save read position when unmounting or periodically
  useEffect(() => {
    const handleScroll = () => {
      // Find the first visible image to save position
      if (!containerRef.current) return;
      const images = containerRef.current.querySelectorAll('img');
      for (let i = 0; i < images.length; i++) {
        const rect = images[i].getBoundingClientRect();
        if (rect.bottom > 0) {
          localStorage.setItem(`read-pos-${manhwaId}-${chapterId}`, i.toString());
          break;
        }
      }
    };

    // Throttle scroll event to save position
    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 1000);
    };

    window.addEventListener('scroll', throttledScroll);
    
    // Restore position on mount
    const saved = localStorage.getItem(`read-pos-${manhwaId}-${chapterId}`);
    if (saved) {
      const index = parseInt(saved, 10);
      // Wait for layout to paint
      setTimeout(() => {
        const images = containerRef.current?.querySelectorAll('img');
        if (images && images[index]) {
          images[index].scrollIntoView();
        }
      }, 100);
    }

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [manhwaId, chapterId]);

  return (
    <div ref={containerRef} className="mx-auto flex w-full max-w-[800px] flex-col bg-ink-950">
      {pageImageUrls.map((url, index) => (
        <div key={index} className="relative w-full">
          <Image
            src={url}
            alt={`หน้า ${index + 1}`}
            width={800}
            height={1200} // Reasonable default height for placeholder ratio
            loading={index < 2 ? 'eager' : 'lazy'}
            priority={index === 0}
            sizes="(max-width: 800px) 100vw, 800px"
            className="block h-auto w-full bg-ink-900"
          />
        </div>
      ))}
    </div>
  );
}
