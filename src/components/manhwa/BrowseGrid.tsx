'use client';

import { Genre, Manhwa, ManhwaStatus, ReadingHistoryEntry } from '@/types';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { ManhwaCard } from './ManhwaCard';
import { clsx } from 'clsx';

interface BrowseGridProps {
  manhwaList: Manhwa[];
  genres: Genre[];
  historyByManhwaId: Record<string, ReadingHistoryEntry>;
  bookmarkedIds: Set<string>;
}

const statusOptions: { value: ManhwaStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'ongoing', label: 'กำลังอัพเดท' },
  { value: 'completed', label: 'จบแล้ว' },
  { value: 'hiatus', label: 'หยุดพัก' },
];

export function BrowseGrid({
  manhwaList,
  genres,
  historyByManhwaId,
  bookmarkedIds,
}: BrowseGridProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ManhwaStatus | 'all'>('all');
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  
  const [isGenresExpanded, setIsGenresExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const genreContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkWrap = () => {
      if (genreContainerRef.current) {
        // A single line of tags is about 28-32px high.
        setShowExpandButton(genreContainerRef.current.scrollHeight > 40);
      }
    };
    
    checkWrap();
    window.addEventListener('resize', checkWrap);
    return () => window.removeEventListener('resize', checkWrap);
  }, [genres]);

  const filtered = useMemo(() => {
    return manhwaList.filter((m) => {
      const matchesQuery = m.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || m.status === status;
      const matchesGenre = !activeGenre || m.genres.some((g) => g.slug === activeGenre);
      return matchesQuery && matchesStatus && matchesGenre;
    });
  }, [manhwaList, query, status, activeGenre]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อเรื่อง..."
            className="w-full rounded-full border border-ink-600 bg-ink-800 py-2 pl-9 pr-4 text-sm text-paper-100 placeholder:text-paper-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={clsx(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                status === opt.value
                  ? 'border-violet-500 bg-violet-500/15 text-violet-400'
                  : 'border-ink-600 text-paper-400 hover:border-ink-500 hover:text-paper-200',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 relative">
        <div
          ref={genreContainerRef}
          className={clsx(
            'flex flex-wrap gap-1.5 flex-1',
            !isGenresExpanded && 'max-h-[30px] overflow-hidden'
          )}
        >
          <button
            onClick={() => setActiveGenre(null)}
            className={clsx(
              'shrink-0 rounded-sm border px-2.5 py-1 text-xs transition-colors',
              !activeGenre
                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                : 'border-ink-600 text-paper-400 hover:text-paper-200',
            )}
          >
            ทุกประเภท
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setActiveGenre(activeGenre === genre.slug ? null : genre.slug)}
              className={clsx(
                'shrink-0 rounded-sm border px-2.5 py-1 text-xs transition-colors',
                activeGenre === genre.slug
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-ink-600 text-paper-400 hover:text-paper-200',
              )}
            >
              {genre.name}
            </button>
          ))}
        </div>
        
        {showExpandButton && (
          <button
            onClick={() => setIsGenresExpanded(!isGenresExpanded)}
            className="flex items-center justify-center shrink-0 rounded-sm border border-ink-600 bg-ink-800 p-1 text-paper-400 hover:text-paper-200 transition-colors"
            title={isGenresExpanded ? "ย่อแท็ก" : "ดูแท็กทั้งหมด"}
          >
            {isGenresExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-md border border-dashed border-ink-600 py-16 text-center">
          <p className="text-paper-300">ไม่พบเรื่องที่ตรงกับการค้นหา</p>
          <p className="mt-1 text-sm text-paper-500">ลองเปลี่ยนคำค้นหรือลบตัวกรองออก</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((m) => (
            <ManhwaCard
              key={m.id}
              manhwa={m}
              history={historyByManhwaId[m.id]}
              bookmarked={bookmarkedIds.has(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
