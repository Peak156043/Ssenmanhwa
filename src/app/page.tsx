import {
  getAllManhwa,
  getAllGenres,
  getReadingHistoryForCurrentUser,
  getBookmarkedManhwaIds,
  getLatestUpdatedManhwa,
  getTotalManhwaCount,
} from '@/lib/queries/manhwa';
import { getCurrentUser } from '@/lib/auth';
import { TopManhwaRanking } from '@/components/manhwa/TopManhwaRanking';
import { LatestUpdatedGrid } from '@/components/manhwa/LatestUpdatedGrid';
import { ReadingHistoryEntry } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';

const PAGE_SIZE = 20;

export default async function HomePage() {
  const [
    manhwaList,
    genres,
    readingHistory,
    bookmarkedIds,
    session,
    latestManhwa,
    totalCount,
  ] = await Promise.all([
    getAllManhwa(),
    getAllGenres(),
    getReadingHistoryForCurrentUser(),
    getBookmarkedManhwaIds(),
    getCurrentUser(),
    getLatestUpdatedManhwa(0, PAGE_SIZE),
    getTotalManhwaCount(),
  ]);

  const historyByManhwaId = readingHistory.reduce((acc, h) => {
    acc[h.manhwaId] = h;
    return acc;
  }, {} as Record<string, ReadingHistoryEntry>);

  if (manhwaList.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-xl text-paper-100">ยังไม่มีมังฮวาในระบบ</h1>
        <p className="mt-2 text-sm text-paper-500">
          เริ่มต้นด้วยการเข้าสู่ระบบผู้ดูแลแล้วเพิ่มเรื่องแรกของคุณ
        </p>
        <Link
          href="/admin/login"
          className="mt-4 inline-block rounded bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
        >
          ไปที่ Admin Panel
        </Link>
      </div>
    );
  }

  const continueReading = readingHistory
    .map((h) => manhwaList.find((m) => m.id === h.manhwaId))
    .filter(Boolean);

  const hasMore = PAGE_SIZE < totalCount;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
      {/* Top 5 most-read ranking with filters */}
      <TopManhwaRanking manhwaList={manhwaList} genres={genres} />

      {/* Continue reading rail — only for logged-in readers */}
      {continueReading.length > 0 && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg text-paper-100">อ่านต่อจากที่ค้างไว้</h2>
            <span className="text-sm text-paper-500">{session?.profile?.username}</span>
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {continueReading.map((m) => {
              if (!m) return null;
              const h = historyByManhwaId[m.id];
              return (
                <Link
                  key={m.id}
                  href={`/manhwa/${m.slug}/chapter/${h.lastChapterNumber}`}
                  className="group w-36 shrink-0 sm:w-44"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-ink-700">
                    {m.coverImageUrl && (
                      <Image
                        src={m.coverImageUrl}
                        alt={m.title}
                        fill
                        sizes="180px"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="line-clamp-1 text-xs font-medium text-paper-100">
                        {m.title}
                      </p>
                      <p className="font-mono text-[11px] text-violet-400">
                        ต่อจากตอนที่ {h.lastChapterNumber}
                      </p>
                    </div>
                  </div>
                  <div className="progress-rail mt-0.5">
                    <div
                      className="progress-rail-fill"
                      style={{ width: `${h.progressPercent}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Latest updated manhwa with pagination */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-violet-400" />
          <h2 className="font-display text-lg text-paper-100">อัพเดทล่าสุด</h2>
        </div>
        <LatestUpdatedGrid
          initialManhwa={latestManhwa}
          hasMore={hasMore}
          historyByManhwaId={historyByManhwaId}
          bookmarkedIds={bookmarkedIds}
          genres={genres}
        />
      </section>
    </div>
  );
}

