'use client';

import { Manhwa, ManhwaStatus, Genre, ReadingHistoryEntry } from '@/types';
import { useState, useCallback, useMemo } from 'react';
import { ManhwaCard } from './ManhwaCard';
import { Loader2, ChevronDown, ArrowUpDown, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface LatestUpdatedGridProps {
  initialManhwa: Manhwa[];
  hasMore: boolean;
  historyByManhwaId: Record<string, ReadingHistoryEntry>;
  bookmarkedIds: Set<string>;
  genres: Genre[];
}

type SortOption = 'latest' | 'oldest' | 'views-desc' | 'views-asc' | 'az' | 'za';

const statusOptions: { value: ManhwaStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'ongoing', label: 'กำลังอัพเดท' },
  { value: 'completed', label: 'จบแล้ว' },
  { value: 'hiatus', label: 'หยุดพัก' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'latest', label: 'อัพเดทล่าสุด' },
  { value: 'oldest', label: 'อัพเดทเก่าสุด' },
  { value: 'views-desc', label: 'อ่านมาก → น้อย' },
  { value: 'views-asc', label: 'อ่านน้อย → มาก' },
  { value: 'az', label: 'ชื่อ A → Z' },
  { value: 'za', label: 'ชื่อ Z → A' },
];

function sortManhwa(list: Manhwa[], sort: SortOption): Manhwa[] {
  const sorted = [...list];
  switch (sort) {
    case 'views-desc':
      return sorted.sort((a, b) => b.views - a.views);
    case 'views-asc':
      return sorted.sort((a, b) => a.views - b.views);
    case 'az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'th'));
    case 'za':
      return sorted.sort((a, b) => b.title.localeCompare(a.title, 'th'));
    case 'latest':
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    default:
      return sorted;
  }
}

export function LatestUpdatedGrid({
  initialManhwa,
  hasMore: initialHasMore,
  historyByManhwaId,
  bookmarkedIds,
  genres,
}: LatestUpdatedGridProps) {
  const [manhwaList, setManhwaList] = useState<Manhwa[]>(initialManhwa);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // page 0 is already loaded as initialManhwa

  // Filters & sort
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ManhwaStatus | 'all'>('all');
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('latest');

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/manhwa/latest?page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setManhwaList((prev) => [...prev, ...data.manhwa]);
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } catch (err) {
      console.error('Failed to load more manhwa:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  const filtered = useMemo(() => {
    const result = manhwaList.filter((m) => {
      const matchesQuery = m.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || m.status === status;
      const matchesGenre = !activeGenre || m.genres.some((g) => g.slug === activeGenre);
      return matchesQuery && matchesStatus && matchesGenre;
    });
    return sortManhwa(result, sort);
  }, [manhwaList, query, status, activeGenre, sort]);

  return (
    <div>
      {/* Filters */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Search + Sort row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-paper-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded border border-ink-600 bg-ink-800 px-2 py-1.5 text-xs text-paper-200 focus:border-violet-500 focus:outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filter */}
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

        {/* Genre filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
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
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-ink-600 py-12 text-center">
          <p className="text-paper-300">ไม่พบเรื่องที่ตรงกับการค้นหา</p>
          <p className="mt-1 text-sm text-paper-500">ลองเปลี่ยนคำค้นหรือลบตัวกรองออก</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="group flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-6 py-2.5 text-sm font-medium text-paper-300 transition-all hover:border-violet-500 hover:bg-violet-500/10 hover:text-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังโหลด...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                โหลดเพิ่มเติม
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
