import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { BookOpen, FileText, FileClock, TrendingUp } from 'lucide-react';
import { DashboardCharts } from '@/components/admin/dashboard/DashboardCharts';

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ count: manhwaCount }, { count: publishedCount }, { count: draftCount }, { data: viewRows }] =
    await Promise.all([
      supabase.from('manhwa').select('*', { count: 'exact', head: true }),
      supabase.from('chapters').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('chapters').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('manhwa').select('views'),
    ]);

  const totalViews = ((viewRows as any[]) ?? []).reduce((sum, row) => sum + (row.views ?? 0), 0);

  const stats = [
    { label: 'มังฮวาทั้งหมด', value: manhwaCount ?? 0, icon: BookOpen },
    { label: 'ตอนที่เผยแพร่แล้ว', value: publishedCount ?? 0, icon: FileText },
    { label: 'ตอนที่ยังเป็น Draft', value: draftCount ?? 0, icon: FileClock },
    { label: 'ยอดเข้าชมรวม', value: `${(totalViews / 1000000).toFixed(1)}M`, icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="font-display text-xl text-paper-100">ภาพรวมระบบ</h1>
      <p className="text-sm text-paper-500">สถานะคอนเทนต์ทั้งหมดในระบบ ณ ปัจจุบัน</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-ink-700 bg-ink-800/60 p-4">
            <s.icon className="h-5 w-5 text-violet-400" />
            <p className="mt-2 font-mono text-2xl text-paper-100">{s.value}</p>
            <p className="text-xs text-paper-500">{s.label}</p>
          </div>
        ))}
      </div>

      <DashboardCharts />
    </div>
  );
}
