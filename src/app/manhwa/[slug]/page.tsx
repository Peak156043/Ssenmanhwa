import { getManhwaBySlug, getChaptersForManhwa, getHistoryForManhwa, isBookmarked } from '@/lib/queries/manhwa';
import { StatusBadge, GenreBadge } from '@/components/ui/Badge';
import { EpisodeList } from '@/components/manhwa/EpisodeList';
import { BookmarkButton } from '@/components/manhwa/BookmarkButton';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Eye, BookOpen, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function ManhwaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manhwa = await getManhwaBySlug(slug);
  if (!manhwa) notFound();

  const [chapters, history, bookmarked] = await Promise.all([
    getChaptersForManhwa(manhwa.id),
    getHistoryForManhwa(manhwa.id),
    isBookmarked(manhwa.id),
  ]);

  const firstChapter = chapters[chapters.length - 1];
  const continueChapter = history
    ? chapters.find((c) => c.chapterNumber === history.lastChapterNumber + 1) ?? firstChapter
    : firstChapter;

  const is18Plus = manhwa.genres.some((g) => g.slug === '18-plus');
  let session = null;
  if (is18Plus) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    session = data.session;
  }
  const isRestricted = is18Plus && !session;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-[2/3] w-40 shrink-0 self-start overflow-hidden rounded-md bg-ink-700 shadow-card sm:w-52">
          {manhwa.coverImageUrl && (
            <Image src={manhwa.coverImageUrl} alt={manhwa.title} fill className="object-cover" priority />
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={manhwa.status} />
            {manhwa.genres.map((g) => (
              <GenreBadge key={g.id} name={g.name} />
            ))}
          </div>

          <h1 className="font-display mt-3 text-2xl text-paper-100 sm:text-3xl">
            {manhwa.title}
          </h1>

          <div className="mt-3 flex items-center gap-4 font-mono text-sm text-paper-400">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400" /> {manhwa.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {(manhwa.views / 1000000).toFixed(1)}M ครั้ง
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {manhwa.totalChapters} ตอน
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper-300">
            {manhwa.synopsis}
          </p>

          {isRestricted ? (
            <div className="mt-8 rounded-lg border border-danger-500/20 bg-danger-500/10 p-6 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-danger-400" />
              <h3 className="mt-4 text-lg font-medium text-paper-100">เนื้อหา 18+</h3>
              <p className="mt-2 text-sm text-paper-400">
                เนื้อหานี้สงวนสิทธิ์สำหรับผู้ใช้ที่มีอายุ 18 ปีขึ้นไปเท่านั้น กรุณาเข้าสู่ระบบเพื่อยืนยันอายุและเข้าถึงเนื้อหา
              </p>
              <div className="mt-6">
                <Link href={`/login?next=/manhwa/${manhwa.slug}`}>
                  <Button size="lg" className="bg-danger-600 hover:bg-danger-700 text-white">
                    เข้าสู่ระบบเพื่ออ่านเนื้อหา
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-5 flex flex-wrap gap-3">
                {chapters.length > 0 ? (
                  <Link href={`/manhwa/${manhwa.slug}/chapter/${continueChapter.chapterNumber}`}>
                    <Button size="lg">
                      {history ? `อ่านต่อตอนที่ ${continueChapter.chapterNumber}` : 'เริ่มอ่านตอนแรก'}
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" disabled>
                    ยังไม่มีตอนเผยแพร่
                  </Button>
                )}
                <BookmarkButton manhwaId={manhwa.id} manhwaSlug={manhwa.slug} initialBookmarked={bookmarked} />
              </div>

              {history && (
                <div className="mt-4 max-w-sm">
                  <div className="flex justify-between text-xs text-paper-500">
                    <span>ความคืบหน้าการอ่าน</span>
                    <span className="font-mono">{history.progressPercent}%</span>
                  </div>
                  <div className="progress-rail mt-1 rounded-full">
                    <div
                      className="progress-rail-fill rounded-full"
                      style={{ width: `${history.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!isRestricted && (
        <div className="mt-10">
          <EpisodeList
            manhwaSlug={manhwa.slug}
            chapters={chapters}
            lastReadChapterNumber={history?.lastChapterNumber}
          />
        </div>
      )}
    </div>
  );
}
