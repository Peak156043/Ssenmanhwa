import { requireUser } from '@/lib/auth';
import { getReadingHistoryForCurrentUser, getManhwaById } from '@/lib/queries/manhwa';
import Image from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export default async function DashboardPage() {
  const { profile, authUser } = await requireUser();
  const readingHistory = await getReadingHistoryForCurrentUser();

  const historyWithManhwa = (
    await Promise.all(
      readingHistory.map(async (h) => ({ history: h, manhwa: await getManhwaById(h.manhwaId) })),
    )
  ).filter((entry) => entry.manhwa);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-violet-500 bg-ink-700">
          {profile?.avatar_url && (
            <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" />
          )}
        </div>
        <div>
          <h1 className="font-display text-xl text-paper-100">{profile?.username ?? 'ผู้ใช้'}</h1>
          <p className="text-sm text-paper-500">{authUser.email}</p>
        </div>
      </div>

      <h2 className="font-display mt-8 text-lg text-paper-100">ประวัติการอ่าน</h2>
      <p className="text-sm text-paper-500">เรื่องที่คุณกำลังอ่านอยู่ เรียงตามที่อ่านล่าสุด</p>

      {historyWithManhwa.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-ink-600 py-12 text-center">
          <p className="text-paper-300">ยังไม่มีประวัติการอ่าน</p>
          <p className="mt-1 text-sm text-paper-500">เริ่มอ่านมังฮวาเรื่องไหนก็ได้ ระบบจะบันทึกไว้ที่นี่</p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-ink-700 rounded-lg border border-ink-700">
          {historyWithManhwa.map(({ history, manhwa }) => (
            <Link
              key={manhwa!.id}
              href={`/manhwa/${manhwa!.slug}/chapter/${history.lastChapterNumber}`}
              className="flex items-center gap-4 p-4 hover:bg-ink-800/60"
            >
              <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-sm bg-ink-700">
                {manhwa!.coverImageUrl && (
                  <Image src={manhwa!.coverImageUrl} alt={manhwa!.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-paper-100">{manhwa!.title}</p>
                <p className="font-mono text-xs text-violet-400">
                  อ่านถึงตอนที่ {history.lastChapterNumber} / {manhwa!.totalChapters}
                </p>
                <div className="progress-rail mt-1.5 max-w-[200px] rounded-full">
                  <div
                    className="progress-rail-fill rounded-full"
                    style={{ width: `${history.progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-paper-500">
                <Clock className="h-3.5 w-3.5" />
                {new Date(history.lastReadAt).toLocaleDateString('th-TH', {
                  day: '2-digit',
                  month: 'short',
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
