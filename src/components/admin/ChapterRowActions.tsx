'use client';

import { useTransition } from 'react';
import { clsx } from 'clsx';
import { toggleChapterStatusAction, deleteChapterAction } from '@/lib/actions/chapters';
import { Trash2 } from 'lucide-react';

export function ChapterRowActions({
  chapterId,
  manhwaSlug,
  status,
}: {
  chapterId: string;
  manhwaSlug: string;
  status: 'draft' | 'published';
}) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => {
      toggleChapterStatusAction(chapterId, manhwaSlug);
    });
  }

  function handleDelete() {
    if (!confirm('ลบตอนนี้ใช่หรือไม่?')) return;
    startTransition(() => {
      deleteChapterAction(chapterId, manhwaSlug);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={pending}
        className={clsx(
          'rounded-sm px-2 py-0.5 text-xs transition-colors disabled:opacity-50',
          status === 'draft'
            ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
            : 'bg-violet-500/15 text-violet-400 hover:bg-violet-500/25',
        )}
        title="คลิกเพื่อสลับสถานะ (บันทึกอัตโนมัติ)"
      >
        {status === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}
      </button>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="rounded p-1 text-paper-500 hover:bg-danger-500/10 hover:text-danger-400 disabled:opacity-50"
        aria-label="ลบตอนนี้"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
