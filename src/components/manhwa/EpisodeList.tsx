'use client';

import { Chapter } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, Circle, ArrowDownUp } from 'lucide-react';
import { clsx } from 'clsx';

interface EpisodeListProps {
  manhwaSlug: string;
  chapters: Chapter[];
  lastReadChapterNumber?: number;
}

export function EpisodeList({
  manhwaSlug,
  chapters,
  lastReadChapterNumber,
}: EpisodeListProps) {
  const [descending, setDescending] = useState(true);

  const sorted = [...chapters].sort((a, b) =>
    descending ? b.chapterNumber - a.chapterNumber : a.chapterNumber - b.chapterNumber,
  );

  return (
    <div>
      <div className="flex items-center justify-between border-b border-ink-700 pb-3">
        <h2 className="font-display text-base text-paper-100">
          รายการตอน ({chapters.length})
        </h2>
        <button
          onClick={() => setDescending((v) => !v)}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-paper-400 hover:bg-ink-700 hover:text-paper-200"
        >
          <ArrowDownUp className="h-3.5 w-3.5" />
          {descending ? 'ตอนล่าสุดก่อน' : 'ตอนแรกก่อน'}
        </button>
      </div>

      <ul className="mt-2 divide-y divide-ink-700">
        {sorted.map((chapter) => {
          const isRead =
            lastReadChapterNumber !== undefined &&
            chapter.chapterNumber <= lastReadChapterNumber;
          return (
            <li key={chapter.id}>
              <Link
                href={`/manhwa/${manhwaSlug}/chapter/${chapter.chapterNumber}`}
                className="flex items-center justify-between gap-3 px-1 py-3 hover:bg-ink-800/60"
              >
                <div className="flex items-center gap-3">
                  {isRead ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-ink-500" />
                  )}
                  <div>
                    <p
                      className={clsx(
                        'text-sm font-medium',
                        isRead ? 'text-paper-400' : 'text-paper-100',
                      )}
                    >
                      ตอนที่ {chapter.chapterNumber}
                    </p>
                    <p className="text-xs text-paper-500">{chapter.title}</p>
                  </div>
                </div>
                <time className="font-mono text-xs text-paper-500">
                  {chapter.publishedAt
                    ? new Date(chapter.publishedAt).toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </time>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
