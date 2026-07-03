import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { AdminsTable } from './AdminsTable';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'จัดการผู้ดูแลระบบ - SSEN Manhwa Admin',
};

export default async function AdminManagementPage() {
  const { admin } = await requireAdmin();
  if (admin.role !== 'superadmin' && admin.role !== 'developer') {
    redirect('/admin');
  }

  const supabase = await createClient();

  const { data: admins } = await supabase
    .from('admin_users')
    .select('id, role, last_login_at')
    .order('role', { ascending: false });

  // Get all potential users to add as admin
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, username, is_banned');

  // Map data to a flat structure for the component
  const flatAdmins = (admins || []).map((a: any) => {
    const user = allUsers?.find((u: any) => u.id === a.id) as any;
    return {
      id: a.id,
      role: a.role,
      last_login_at: a.last_login_at,
      username: user ? user.username : 'Unknown',
      is_banned: user ? user.is_banned : false,
    };
  });

  // Filter out users who are already admins
  const availableUsers = ((allUsers as any[]) || []).filter(
    (u) => !flatAdmins.find((a) => a.id === u.id)
  );

  const totalAdmins = flatAdmins.length;
  const bannedAdmins = flatAdmins.filter((a: any) => a.is_banned).length;
  const activeAdmins = totalAdmins - bannedAdmins;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper-100">จัดการผู้ดูแลระบบ</h1>
        <p className="mt-1 text-sm text-paper-400">
          สำหรับ Super Admin และ Developer เท่านั้น: เพิ่ม/ลดสิทธิ์หรือลบผู้ดูแลระบบคนอื่นได้
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-ink-700 bg-ink-800 p-4">
          <p className="text-sm text-paper-400">ทั้งหมด</p>
          <p className="mt-1 text-2xl font-bold text-paper-100">{totalAdmins}</p>
        </div>
        <div className="rounded-lg border border-ink-700 bg-ink-800 p-4">
          <p className="text-sm text-paper-400">ใช้งานได้</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{activeAdmins}</p>
        </div>
        <div className="rounded-lg border border-ink-700 bg-ink-800 p-4">
          <p className="text-sm text-paper-400">ถูกแบน</p>
          <p className="mt-1 text-2xl font-bold text-danger-400">{bannedAdmins}</p>
        </div>
      </div>

      <AdminsTable 
        admins={flatAdmins} 
        availableUsers={availableUsers} 
        currentUserId={admin.id} 
        currentUserRole={admin.role} 
      />
    </div>
  );
}
