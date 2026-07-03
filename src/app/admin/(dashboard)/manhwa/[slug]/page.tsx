import { getManhwaBySlug, getChaptersForManhwa } from '@/lib/queries/manhwa';
import { getAllGenres } from '@/lib/queries/manhwa';
import { ManhwaForm } from '@/components/admin/ManhwaForm';
import { ChapterRowActions } from '@/components/admin/ChapterRowActions';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ListPlus } from 'lucide-react';

export default async function EditManhwaPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const manhwa = await getManhwaBySlug(slug);
  if (!manhwa) notFound();

  const [chapters, genres] = await Promise.all([
    getChaptersForManhwa(manhwa.id, true),
    getAllGenres(),
  ]);
  const sortedChapters = [...chapters].sort((a, b) => b.chapterNumber - a.chapterNumber);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-paper-100">แก้ไข: {manhwa.title}</h1>
          <p className="text-sm text-paper-500">อัปเดตข้อมูลพื้นฐานของเรื่อง</p>
        </div>
        <Link
          href={`/admin/manhwa/${manhwa.slug}/chapters/new`}
          className="flex items-center gap-1.5 rounded bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
        >
          <ListPlus className="h-4 w-4" />
          เพิ่มตอนใหม่
        </Link>
      </div>

      <div className="mt-6 max-w-3xl rounded-lg border border-ink-700 bg-ink-800/40 p-6">
        <ManhwaForm mode="edit" initial={manhwa} genres={genres} chapters={sortedChapters} />
      </div>
    </div>
  );
}
