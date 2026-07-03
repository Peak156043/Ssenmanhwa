import { getManhwaBySlug } from '@/lib/queries/manhwa';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ChapterUploadForm } from '@/components/admin/ChapterUploadForm';
import Image from 'next/image';

export default async function NewChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const manhwa = await getManhwaBySlug(slug);
  if (!manhwa) notFound();

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-sm bg-ink-700">
          {manhwa.coverImageUrl && (
            <Image src={manhwa.coverImageUrl} alt={manhwa.title} fill className="object-cover" />
          )}
        </div>
        <div>
          <h1 className="font-display text-xl text-paper-100">เพิ่มตอนใหม่</h1>
          <p className="text-sm text-paper-500">{manhwa.title}</p>
        </div>
      </div>

      <div className="mt-6 max-w-4xl rounded-lg border border-ink-700 bg-ink-800/40 p-6">
        <ChapterUploadForm manhwaId={manhwa.id} manhwaSlug={manhwa.slug} />
      </div>
    </div>
  );
}
