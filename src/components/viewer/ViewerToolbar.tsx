'use client';

import { Chapter } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, List, Home } from 'lucide-react';

interface ViewerToolbarProps {
  manhwaSlug: string;
  manhwaTitle: string;
  currentChapter: Chapter;
  allChapters: Chapter[]; // ascending order
  position: 'top' | 'bottom';
}

export function ViewerToolbar({
  manhwaSlug,
  manhwaTitle,
  currentChapter,
  allChapters,
  position,
}: ViewerToolbarProps) {
  const router = useRouter();
  const sortedDesc = [...allChapters].sort((a, b) => b.chapterNumber - a.chapterNumber);

  const idx = allChapters.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = idx > 0 ? allChapters[idx - 1] : null;
  const nextChapter = idx < allChapters.length - 1 ? allChapters[idx + 1] : null;

  function goToChapter(chapterNumber: string) {
    router.push(`/manhwa/${manhwaSlug}/chapter/${chapterNumber}`);
  }

  return (
    <div
      id={position === 'top' ? 'chapter-header' : undefined}
      className={
        position === 'top'
          ? 'sticky top-[57px] z-30 border-b border-ink-700 bg-ink-900/95 backdrop-blur'
          : 'border-t border-ink-700 bg-ink-900'
      }
    >
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5 sm:px-6">
        <Link
          href={`/manhwa/${manhwaSlug}`}
          className="flex items-center gap-1 rounded p-2 text-paper-400 hover:bg-ink-700 hover:text-paper-100"
          aria-label="กลับไปหน้ารายละเอียด"
        >
          <Home className="h-4 w-4" />
        </Link>

        <button
          onClick={() => prevChapter && goToChapter(String(prevChapter.chapterNumber))}
          disabled={!prevChapter}
          className="flex items-center gap-1 rounded px-2 py-2 text-sm text-paper-300 hover:bg-ink-700 hover:text-paper-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">ตอนก่อนหน้า</span>
        </button>

        <div className="relative flex flex-1 items-center justify-center gap-1.5">
          <List className="hidden h-4 w-4 text-paper-500 sm:block" />
          <select
            value={currentChapter.chapterNumber}
            onChange={(e) => goToChapter(e.target.value)}
            className="max-w-[55vw] rounded border border-ink-600 bg-ink-800 px-2 py-1.5 text-sm text-paper-100 focus:border-violet-500 focus:outline-none sm:max-w-xs"
            aria-label="เลือกตอน"
          >
            {sortedDesc.map((c) => (
              <option key={c.id} value={c.chapterNumber}>
                ตอนที่ {c.chapterNumber} — {c.title}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => nextChapter && goToChapter(String(nextChapter.chapterNumber))}
          disabled={!nextChapter}
          className="flex items-center gap-1 rounded px-2 py-2 text-sm text-paper-300 hover:bg-ink-700 hover:text-paper-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="hidden sm:inline">ตอนถัดไป</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      {position === 'top' && (
        <p className="mx-auto max-w-3xl truncate px-4 pb-2 text-xs text-paper-500 sm:px-6">
          {manhwaTitle} · ตอนที่ {currentChapter.chapterNumber}
        </p>
      )}
    </div>
  );
}
