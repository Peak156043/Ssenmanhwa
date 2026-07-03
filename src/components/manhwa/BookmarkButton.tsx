'use client';

import { Bookmark } from 'lucide-react';
import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { toggleBookmarkAction } from '@/lib/actions/reader';
import { useRouter } from 'next/navigation';

export function BookmarkButton({
  manhwaId,
  manhwaSlug,
  initialBookmarked,
}: {
  manhwaId: string;
  manhwaSlug: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await toggleBookmarkAction(manhwaId, manhwaSlug);
      if (result.error) {
        setError(result.error);
        if (result.error.includes('เข้าสู่ระบบ')) {
          router.push('/login');
        }
        return;
      }
      setBookmarked(result.bookmarked);
    });
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={pending}
        aria-pressed={bookmarked}
        className={clsx(
          'flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60',
          bookmarked
            ? 'border-amber-500 bg-amber-500/15 text-amber-400'
            : 'border-ink-500 bg-ink-800 text-paper-200 hover:border-ink-400',
        )}
      >
        <Bookmark className={clsx('h-4 w-4', bookmarked && 'fill-amber-400')} />
        {bookmarked ? 'บันทึกแล้ว' : 'บันทึกเป็นเรื่องโปรด'}
      </button>
      {error && !error.includes('เข้าสู่ระบบ') && (
        <p className="mt-1 text-xs text-danger-400">{error}</p>
      )}
    </div>
  );
}
