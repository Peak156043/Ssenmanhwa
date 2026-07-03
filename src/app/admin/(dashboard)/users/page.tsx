import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { UsersTable } from './UsersTable';

export const metadata = {
  title: 'จัดการผู้ใช้ - SSEN Manhwa Admin',
};

export default async function AdminUsersPage() {
  const { admin } = await requireAdmin();
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: admins } = await supabase.from('admin_users').select('id');
  const adminIds = new Set((admins || []).map((a: any) => a.id));
  const regularUsers = (users || []).filter((u: any) => !adminIds.has(u.id));

  const totalUsers = regularUsers.length;
  const bannedUsers = regularUsers.filter((u: any) => u.is_banned).length;
  const activeUsers = totalUsers - bannedUsers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper-100">จัดการผู้ใช้</h1>
        <p className="mt-1 text-sm text-paper-400">
          ดูรายชื่อ ระงับการใช้งาน หรือลบบัญชีผู้ใช้ (ลบได้เฉพาะ Super Admin)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-ink-700 bg-ink-800 p-4">
          <p className="text-sm text-paper-400">ทั้งหมด</p>
          <p className="mt-1 text-2xl font-bold text-paper-100">{totalUsers}</p>
        </div>
        <div className="rounded-lg border border-ink-700 bg-ink-800 p-4">
          <p className="text-sm text-paper-400">ใช้งานได้</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{activeUsers}</p>
        </div>
        <div className="rounded-lg border border-ink-700 bg-ink-800 p-4">
          <p className="text-sm text-paper-400">ถูกแบน</p>
          <p className="mt-1 text-2xl font-bold text-danger-400">{bannedUsers}</p>
        </div>
      </div>

      <UsersTable users={regularUsers} adminRole={admin.role} />
    </div>
  );
}
