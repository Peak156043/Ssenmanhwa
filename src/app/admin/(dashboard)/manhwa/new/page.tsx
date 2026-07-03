import { ManhwaForm } from '@/components/admin/ManhwaForm';
import { requireAdmin } from '@/lib/auth';
import { getAllGenres } from '@/lib/queries/manhwa';

export default async function NewManhwaPage() {
  await requireAdmin();
  const genres = await getAllGenres();

  return (
    <div>
      <h1 className="font-display text-xl text-paper-100">เพิ่มเรื่องใหม่</h1>
      <p className="text-sm text-paper-500">กรอกข้อมูลเรื่องใหม่ก่อนเริ่มเพิ่มตอน</p>
      <div className="mt-6 max-w-3xl rounded-lg border border-ink-700 bg-ink-800/40 p-6">
        <ManhwaForm mode="create" genres={genres} />
      </div>
    </div>
  );
}
