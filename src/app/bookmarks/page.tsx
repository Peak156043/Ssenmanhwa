import { requireUser } from '@/lib/auth';
import { getBookmarkedManhwa, getReadingHistoryForCurrentUser } from '@/lib/queries/manhwa';
import { ManhwaCard } from '@/components/manhwa/ManhwaCard';
import { ReadingHistoryEntry } from '@/types';

export default async function BookmarksPage() {
  await requireUser();
  const [bookmarkedManhwa, readingHistory] = await Promise.all([
    getBookmarkedManhwa(),
    getReadingHistoryForCurrentUser(),
  ]);

  const historyByManhwaId = readingHistory.reduce((acc, h) => {
    acc[h.manhwaId] = h;
    return acc;
  }, {} as Record<string, ReadingHistoryEntry>);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-xl text-paper-100">เรื่องโปรดของฉัน</h1>
      <p className="text-sm text-paper-500">เรื่องที่คุณบันทึกไว้ทั้งหมด {bookmarkedManhwa.length} เรื่อง</p>

      {bookmarkedManhwa.length === 0 ? (
        <div className="mt-12 rounded-md border border-dashed border-ink-600 py-16 text-center">
          <p className="text-paper-300">ยังไม่มีเรื่องโปรด</p>
          <p className="mt-1 text-sm text-paper-500">
            กดปุ่ม &ldquo;บันทึกเป็นเรื่องโปรด&rdquo; ในหน้าเรื่องที่คุณชอบเพื่อเก็บไว้ที่นี่
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {bookmarkedManhwa.map((m) => (
            <ManhwaCard key={m.id} manhwa={m} history={historyByManhwaId[m.id]} bookmarked />
          ))}
        </div>
      )}
    </div>
  );
}
