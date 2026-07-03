'use client';

import { useEffect, useRef } from 'react';
import { recordChapterReadAction } from '@/lib/actions/reader';

interface ChapterReadTrackerProps {
  manhwaId: string;
  manhwaSlug: string;
  chapterId: string;
  chapterNumber: number;
}

/**
 * Renders nothing — purely fires the read-tracking server action once when
 * a chapter view mounts. Separated from the page itself (a Server
 * Component) because calling a Server Action automatically on render needs
 * a client-side effect; the action itself still runs on the server and
 * silently no-ops for logged-out readers (reading never requires login).
 */
export function ChapterReadTracker({
  manhwaId,
  manhwaSlug,
  chapterId,
  chapterNumber,
}: ChapterReadTrackerProps) {
  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (recordedRef.current === chapterId) return;
    recordedRef.current = chapterId;
    recordChapterReadAction(manhwaId, manhwaSlug, chapterId, chapterNumber);
  }, [manhwaId, manhwaSlug, chapterId, chapterNumber]);

  return null;
}
