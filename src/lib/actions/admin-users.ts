'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireAdmin, canManageRole } from '@/lib/auth';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY!
  );
};

export async function toggleBanUserAction(userId: string, isBanned: boolean) {
  const { admin } = await requireAdmin();
  const supabaseAdmin = getAdminClient();

  // Check target's role
  const { data: targetAdmin } = await supabaseAdmin.from('admin_users').select('role').eq('id', userId).maybeSingle();
  if (targetAdmin && !canManageRole(admin.role, targetAdmin.role)) {
    return { error: 'ไม่มีสิทธิ์ระงับผู้ใช้นี้' };
  }
  
  if (admin.id === userId) {
    return { error: 'ไม่สามารถแบนตัวเองได้' };
  }

  const supabase = await createClient();

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      is_banned: !isBanned,
      banned_at: !isBanned ? new Date().toISOString() : null,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error toggling ban:', error);
    return { error: 'ไม่สามารถเปลี่ยนสถานะการแบนได้' };
  }

  // Log action
  await supabaseAdmin.from('audit_log').insert({
    admin_id: admin.id,
    action: !isBanned ? 'ban_user' : 'unban_user',
    target_type: 'user',
    target_id: userId,
  } as any);

  revalidatePath('/admin/users');
  revalidatePath('/admin/admins');
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  const { admin } = await requireAdmin();
  
  if (admin.id === userId) {
    return { error: 'ไม่สามารถลบตัวเองได้' };
  }

  const supabaseAdminClient = getAdminClient();
  
  const { data: targetAdmin } = await supabaseAdminClient.from('admin_users').select('role').eq('id', userId).maybeSingle();
  if (targetAdmin && !canManageRole(admin.role, targetAdmin.role)) {
    return { error: 'ไม่มีสิทธิ์ลบผู้ใช้นี้' };
  }

  const supabase = await createClient();

  const { error } = await supabaseAdminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.error('Error deleting user:', error);
    return { error: 'ไม่สามารถลบผู้ใช้ได้' };
  }

  // Log action
  await (supabase as any).from('audit_log').insert({
    admin_id: admin.id,
    action: 'delete_user',
    target_type: 'user',
    target_id: userId,
  } as any);

  revalidatePath('/admin/users');
  revalidatePath('/admin/admins');
  return { success: true };
}
