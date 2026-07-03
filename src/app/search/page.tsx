import { getAllManhwa, getReadingHistoryForCurrentUser, getBookmarkedManhwaIds } from '@/lib/queries/manhwa';
import { ManhwaCard } from '@/components/manhwa/ManhwaCard';
import { ReadingHistoryEntry } from '@/types';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  const [allManhwa, readingHistory, bookmarkedIds] = await Promise.all([
    getAllManhwa(),
    getReadingHistoryForCurrentUser(),
    getBookmarkedManhwaIds(),
  ]);

  const results = query
    ? allManhwa.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
    : allManhwa;

  const historyByManhwaId = readingHistory.reduce((acc, h) => {
    acc[h.manhwaId] = h;
    return acc;
  }, {} as Record<string, ReadingHistoryEntry>);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-xl text-paper-100">
        {query ? `ผลการค้นหา: "${query}"` : 'เรื่องทั้งหมด'}
      </h1>
      <p className="text-sm text-paper-500">พบ {results.length} เรื่อง</p>

      {results.length === 0 ? (
        <div className="mt-12 rounded-md border border-dashed border-ink-600 py-16 text-center">
          <p className="text-paper-300">ไม่พบเรื่องที่ตรงกับคำค้นหา</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((m) => (
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
