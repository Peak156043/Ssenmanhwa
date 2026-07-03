import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getAllManhwa } from '@/lib/queries/manhwa';
import { StatusBadge } from '@/components/ui/Badge';
import { ManhwaSearchFilter } from '@/components/admin/manhwa/ManhwaSearchFilter';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Pencil, ListPlus } from 'lucide-react';

export default async function AdminManhwaListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : undefined;
  const status = typeof params.status === 'string' ? params.status : undefined;

  const supabase = await createClient();

  const manhwaList = await getAllManhwa(q, status);

  const { data: draftCounts } = await supabase
    .from('chapters')
    .select('manhwa_id')
    .eq('status', 'draft');

  const draftCountByManhwa = ((draftCounts as any[]) ?? []).reduce((acc, row) => {
    acc[row.manhwa_id] = (acc[row.manhwa_id] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-paper-100">จัดการมังฮวา</h1>
          <p className="text-sm text-paper-500">ทั้งหมด {manhwaList.length} เรื่อง</p>
        </div>
        <Link
          href="/admin/manhwa/new"
          className="flex items-center gap-1.5 rounded bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
        >
          <Plus className="h-4 w-4" />
          เพิ่มเรื่องใหม่
        </Link>
      </div>

      <ManhwaSearchFilter />

      {manhwaList.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-ink-600 py-16 text-center">
          <p className="text-paper-300">ยังไม่มีมังฮวาในระบบ</p>
          <Link
            href="/admin/manhwa/new"
            className="mt-3 inline-block rounded bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            เพิ่มเรื่องแรก
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-ink-700">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-700 bg-ink-800/60 text-left text-paper-400">
              <tr>
                <th className="px-4 py-3 font-medium">เรื่อง</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">ตอนทั้งหมด</th>
                <th className="px-4 py-3 font-medium">ฉบับร่าง</th>
                <th className="px-4 py-3 font-medium">อัปเดตล่าสุด</th>
                <th className="px-4 py-3 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {manhwaList.map((m) => {
                const draftCount = draftCountByManhwa[m.id] ?? 0;
                return (
                  <tr key={m.id} className="hover:bg-ink-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-sm bg-ink-700">
                          {m.coverImageUrl && (
                            <Image src={m.coverImageUrl} alt={m.title} fill className="object-cover" />
                          )}
                        </div>
                        <span className="font-medium text-paper-100">{m.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-paper-300">{m.totalChapters}</td>
                    <td className="px-4 py-3 font-mono">
                      {draftCount > 0 ? (
                        <span className="text-amber-400">{draftCount}</span>
                      ) : (
                        <span className="text-paper-500">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-paper-400">
                      {new Date(m.updatedAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/manhwa/${m.slug}/chapters/new`}
                          className="flex items-center gap-1 rounded px-2 py-1.5 text-xs text-paper-300 hover:bg-ink-700 hover:text-paper-100"
                          title="เพิ่มตอนใหม่"
                        >
                          <ListPlus className="h-3.5 w-3.5" />
                          เพิ่มตอน
                        </Link>
                        <Link
                          href={`/admin/manhwa/${m.slug}`}
                          className="flex items-center gap-1 rounded px-2 py-1.5 text-xs text-paper-300 hover:bg-ink-700 hover:text-paper-100"
                          title="แก้ไขข้อมูลเรื่อง"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          แก้ไข
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
