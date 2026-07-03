import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { requireAdmin } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already blocks non-admins from reaching here, but this is
  // re-checked at the layout level too (defense in depth) and gives us the
  // admin's role to show in the sidebar.
  const { admin } = await requireAdmin();

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <AdminSidebar role={admin.role} />
      <div className="flex-1 bg-ink-900 p-4 sm:p-8">{children}</div>
    </div>
  );
}
