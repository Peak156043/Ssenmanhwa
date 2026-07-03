import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

import type { Database } from '@/types/database';

export async function getCurrentUser(): Promise<{
  authUser: any;
  profile: Database['public']['Tables']['users']['Row'];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if ((profile as any)?.is_banned) {
    await supabase.auth.signOut();
    redirect('/login?error=banned');
  }

  return { authUser: user, profile: profile as unknown as Database['public']['Tables']['users']['Row'] };
}

/** Throws via redirect() if not logged in. Use in pages that require a session. */
export async function requireUser() {
  const result = await getCurrentUser();
  if (!result) redirect('/login');
  return result;
}



export async function getAdminStatus(): Promise<{
  authUser: any;
  admin: Database['public']['Tables']['admin_users']['Row'];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRow) return null;
  return { authUser: user, admin: adminRow as unknown as Database['public']['Tables']['admin_users']['Row'] };
}

/**
 * Server Action / page guard. Middleware already blocks unauthenticated and
 * non-admin users from reaching /admin/* routes, but Server Actions can be
 * invoked directly (not just via page navigation), so every mutating action
 * re-checks here too — defense in depth, not redundant.
 */
export async function requireAdmin() {
  const result = await getAdminStatus();
  if (!result) redirect('/admin/login?error=not_admin');
  return result;
}

export function getRoleWeight(role?: string | null): number {
  if (role === 'developer') return 3;
  if (role === 'superadmin') return 2;
  if (role === 'admin' || role === 'editor') return 1;
  return 0; // regular user
}

export function canManageRole(actorRole: string, targetRole?: string | null): boolean {
  const actorWeight = getRoleWeight(actorRole);
  const targetWeight = getRoleWeight(targetRole);
  
  if (actorRole === 'developer') {
    return actorWeight >= targetWeight; // developer can manage developer
  }
  return actorWeight > targetWeight; // superadmin can only manage admin/user
}
