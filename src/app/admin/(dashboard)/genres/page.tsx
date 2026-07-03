import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { GenreManager } from '@/components/admin/GenreManager';

export default async function AdminGenresPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: genres } = await supabase.from('genres').select('*').order('name');

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl text-paper-100">จัดการแท็ก (Genres)</h1>
        <p className="text-sm text-paper-500">เพิ่ม ลบ หรือแก้ไขชื่อแท็กและ URL (Slug)</p>
      </div>

      <GenreManager initialGenres={genres || []} />
    </div>
  );
}
