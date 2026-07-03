'use client';

import { Genre, Manhwa, ManhwaStatus } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Eye, Star, TrendingUp, ArrowUpDown } from 'lucide-react';

interface TopManhwaRankingProps {
  manhwaList: Manhwa[];
  genres: Genre[];
}

type SortOption = 'views-desc' | 'views-asc' | 'az' | 'za' | 'latest' | 'oldest';

const statusOptions: { value: ManhwaStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'ongoing', label: 'กำลังอัพเดท' },
  { value: 'completed', label: 'จบแล้ว' },
  { value: 'hiatus', label: 'หยุดพัก' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'views-desc', label: 'อ่านมาก → น้อย' },
  { value: 'views-asc', label: 'อ่านน้อย → มาก' },
  { value: 'az', label: 'ชื่อ A → Z' },
  { value: 'za', label: 'ชื่อ Z → A' },
  { value: 'latest', label: 'อัพเดทล่าสุด' },
  { value: 'oldest', label: 'อัพเดทเก่าสุด' },
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

export function TopManhwaRanking({ manhwaList, genres }: TopManhwaRankingProps) {
  const [status, setStatus] = useState<ManhwaStatus | 'all'>('all');
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('views-desc');

  const top5 = useMemo(() => {
    return sortManhwa(
      manhwaList.filter((m) => {
        const matchesStatus = status === 'all' || m.status === status;
        const matchesGenre = !activeGenre || m.genres.some((g) => g.slug === activeGenre);
        return matchesStatus && matchesGenre;
      }),
      sort,
    ).slice(0, 5);
  }, [manhwaList, status, activeGenre, sort]);

  function formatViews(views: number): string {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return String(views);
  }

  return (
    <section>
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-amber-400" />
        <h2 className="font-display text-lg text-paper-100">อ่านมากที่สุด</h2>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Status + Sort row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

          {/* Sort dropdown */}
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

      {/* Ranking — horizontal card row */}
      {top5.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-ink-600 py-12 text-center">
          <p className="text-paper-300">ไม่พบเรื่องที่ตรงกับตัวกรอง</p>
          <p className="mt-1 text-sm text-paper-500">ลองเปลี่ยนตัวกรองดู</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {top5.map((m, idx) => (
            <Link
              key={m.id}
              href={`/manhwa/${m.slug}`}
              className="group block overflow-hidden rounded-md border border-ink-700 bg-ink-800 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-ink-600"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-ink-700">
                {m.coverImageUrl && (
                  <Image
                    src={m.coverImageUrl}
                    alt={m.title}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />

                {/* Rank badge */}
                <div
                  className={clsx(
                    'absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md font-display text-sm shadow-lg',
                    idx === 0 && 'bg-amber-500 text-ink-950',
                    idx === 1 && 'bg-paper-300 text-ink-950',
                    idx === 2 && 'bg-amber-600 text-ink-950',
                    idx >= 3 && 'bg-ink-700/90 text-paper-300',
                  )}
                >
                  {idx + 1}
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-paper-100">
                    {m.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-paper-300">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {formatViews(m.views)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-400" />
                      {m.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chapter count */}
              <div className="px-2.5 py-2">
                <p className="font-mono text-xs text-paper-400">
                  ทั้งหมด {m.totalChapters} ตอน
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
