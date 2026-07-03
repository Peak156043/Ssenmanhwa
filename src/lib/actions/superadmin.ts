'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireAdmin, canManageRole, getRoleWeight } from '@/lib/auth';

// Helper to get service role client for admin management (bypasses RLS)
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
};

export async function addAdminAction(userId: string, role: 'admin' | 'superadmin' | 'developer') {
  const { admin } = await requireAdmin();
  
  // Can't grant a role higher than your own
  if (getRoleWeight(admin.role) < getRoleWeight(role)) {
    return { error: 'ไม่สามารถมอบสิทธิ์ที่สูงกว่าตัวเองได้' };
  }

  const supabase = getAdminClient();

  // Check if they already have a role (just in case)
  const { data: targetAdmin } = await supabase.from('admin_users').select('role').eq('id', userId).maybeSingle();
  if (targetAdmin) {
    return { error: 'ผู้ใช้นี้เป็น Admin อยู่แล้ว' };
  }

  const { error } = await supabase
    .from('admin_users')
    .insert({ id: userId, role });

  if (error) {
    return { error: 'ไม่สามารถเพิ่ม Admin ได้' };
  }

  revalidatePath('/admin/admins');
  return { success: true };
}

export async function removeAdminAction(userId: string) {
  const { admin } = await requireAdmin();

  // Prevent removing oneself
  if (admin.id === userId) return { error: 'ไม่สามารถลบสิทธิ์ตัวเองได้' };

  const supabase = getAdminClient();

  const { data: targetAdmin } = await supabase.from('admin_users').select('role').eq('id', userId).maybeSingle();
  if (!targetAdmin) return { error: 'ไม่พบผู้ใช้' };

  if (!canManageRole(admin.role, targetAdmin.role)) {
    return { error: 'ไม่มีสิทธิ์ลบผู้ใช้ระดับนี้' };
  }

  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', userId);

  if (error) return { error: 'ไม่สามารถลบ Admin ได้' };

  revalidatePath('/admin/admins');
  return { success: true };
}

export async function changeAdminRoleAction(userId: string, newRole: 'admin' | 'superadmin' | 'developer') {
  const { admin } = await requireAdmin();

  if (admin.id === userId) {
    return { error: 'ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้' };
  }

  if (getRoleWeight(admin.role) < getRoleWeight(newRole)) {
    return { error: 'ไม่สามารถมอบสิทธิ์ที่สูงกว่าตัวเองได้' };
  }

  const supabase = getAdminClient();

  const { data: targetAdmin } = await supabase.from('admin_users').select('role').eq('id', userId).maybeSingle();
  if (!targetAdmin) return { error: 'ไม่พบผู้ใช้' };

  if (!canManageRole(admin.role, targetAdmin.role)) {
    return { error: 'ไม่มีสิทธิ์แก้ไขผู้ใช้ระดับนี้' };
  }

  const { error } = await supabase
    .from('admin_users')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) return { error: 'ไม่สามารถเปลี่ยนสิทธิ์ได้' };

  revalidatePath('/admin/admins');
  return { success: true };
}
