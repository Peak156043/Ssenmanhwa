'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { AuthActionState } from './auth';

export async function adminSignInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'กรุณากรอกอีเมลและรหัสผ่าน' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
  }

  // Same Supabase Auth as regular users — what gates /admin access is
  // membership in admin_users, checked here AND re-checked by middleware
  // on every subsequent request to an /admin route.
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!adminRow) {
    // Valid account, but not an admin — sign them back out of this session
    // rather than leaving an authenticated-but-unauthorized cookie behind.
    await supabase.auth.signOut();
    return { error: 'บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล' };
  }

  await (supabase as any)
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.user.id);

  revalidatePath('/admin', 'layout');
  redirect('/admin');
}
