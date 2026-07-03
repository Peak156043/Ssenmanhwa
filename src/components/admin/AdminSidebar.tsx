'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, LogOut, ShieldCheck, Users, Shield, Globe } from 'lucide-react';
import { signOutAction } from '@/lib/actions/auth';
import type { AdminRoleDb } from '@/types/database';
import { clsx } from 'clsx';

export function AdminSidebar({ role }: { role: AdminRoleDb }) {
  const pathname = usePathname();

  const getLinkClass = (path: string, exact = false) => {
    const isActive = exact ? pathname === path : pathname.startsWith(path);
    return clsx(
      'flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors',
      isActive
        ? 'bg-ink-800 text-paper-100'
        : 'text-paper-300 hover:bg-ink-800 hover:text-paper-100'
    );
  };

  return (
    <aside className="hidden w-56 shrink-0 border-r border-ink-700 bg-ink-950 sm:block">
      <div className="flex items-center gap-2 border-b border-ink-700 px-4 py-4">
        <ShieldCheck className="h-5 w-5 text-violet-400" />
        <div>
          <span className="font-display block text-sm text-paper-100">Admin Panel</span>
          <span className="text-xs text-paper-500">
            {role === 'developer' ? 'Developer' : role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Editor'}
          </span>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        <Link href="/admin" className={getLinkClass('/admin', true)}>
          <LayoutDashboard className="h-4 w-4" />
          ภาพรวม
        </Link>
        <Link href="/admin/manhwa" className={getLinkClass('/admin/manhwa')}>
          <BookOpen className="h-4 w-4" />
          จัดการมังฮวา
        </Link>
        <Link href="/admin/genres" className={getLinkClass('/admin/genres')}>
          <BookOpen className="h-4 w-4 opacity-70" />
          จัดการแท็ก
        </Link>
        <Link href="/admin/users" className={getLinkClass('/admin/users')}>
          <Users className="h-4 w-4" />
          จัดการผู้ใช้
        </Link>
        {(role === 'superadmin' || role === 'developer') && (
          <Link href="/admin/admins" className={getLinkClass('/admin/admins')}>
            <Shield className="h-4 w-4" />
            จัดการ Admin
          </Link>
        )}
        <Link
          href="/"
          className="mt-4 flex items-center gap-2 rounded px-3 py-2 text-sm text-paper-500 hover:bg-ink-800 hover:text-paper-200"
        >
          <Globe className="h-4 w-4" />
          ดูหน้าเว็บ
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-danger-400 hover:bg-danger-500/10"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </form>
      </nav>
    </aside>
  );
}
