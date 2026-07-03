import Image from 'next/image';
import Link from 'next/link';
import { Manhwa, ReadingHistoryEntry } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { BookmarkCheck } from 'lucide-react';

interface ManhwaCardProps {
  manhwa: Manhwa;
  history?: ReadingHistoryEntry;
  bookmarked?: boolean;
}

export function ManhwaCard({ manhwa, history, bookmarked }: ManhwaCardProps) {
  return (
    <Link
      href={`/manhwa/${manhwa.slug}`}
      className="group block overflow-hidden rounded-md bg-ink-800 shadow-card transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-ink-700">
        {manhwa.coverImageUrl && (
          <Image
            src={manhwa.coverImageUrl}
            alt={manhwa.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />

        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          <StatusBadge status={manhwa.status} />
        </div>

        {bookmarked && (
          <div className="absolute right-2 top-2 rounded-full bg-ink-950/80 p-1.5">
            <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
          </div>
        )}

        {history && (
          <span className="absolute right-2 top-2 rounded-sm bg-violet-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            กำลังอ่าน
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-paper-100">
            {manhwa.title}
          </h3>
          <p className="mt-1 font-mono text-xs text-paper-300">
            ทั้งหมด {manhwa.totalChapters} ตอน
          </p>
        </div>
      </div>

      {/* Signature element: progress rail showing this user's read-through */}
      <div className="progress-rail">
        {history && (
          <div
            className="progress-rail-fill"
            style={{ width: `${history.progressPercent}%` }}
          />
        )}
      </div>
    </Link>
  );
}
