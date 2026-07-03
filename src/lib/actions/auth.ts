'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export interface AuthActionState {
  error: string | null;
  success?: string | null;
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const username = String(formData.get('username') ?? '').trim();

  if (!email || !password || !username) {
    return { error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' };
  }
  if (password.length < 8) {
    return { error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว' };
    }
    return { error: 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }

  if (data.user) {
    const { error: usernameError } = await (supabase as any)
      .from('users')
      .update({ username })
      .eq('id', data.user.id);

    if (usernameError?.message.includes('duplicate')) {
      return { error: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว กรุณาเลือกชื่ออื่น' };
    }
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signInAction(
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

  // เช็คว่าถูกแบนหรือไม่
  const { data: profile } = await supabase
    .from('users')
    .select('is_banned')
    .eq('id', data.user.id)
    .maybeSingle();

  if ((profile as any)?.is_banned) {
    await supabase.auth.signOut();
    return { error: 'บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ' };
  }

  // เช็ค role — ถ้าเป็น admin/superadmin redirect ไปหน้า admin
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (adminRow) {
    await (supabase as any)
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id);
  }

  revalidatePath('/', 'layout');

  // Redirect ตาม role
  if (adminRow) {
    redirect('/admin');
  }
  redirect('/dashboard');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

// ==================== Google OAuth ====================

export async function signInWithGoogleAction(formData?: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    redirect('/login?error=google_failed');
  }

  if (data.url) {
    redirect(data.url);
  }
}

// ==================== Password Recovery ====================

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    return { error: 'กรุณากรอกอีเมล' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    return { error: 'ไม่สามารถส่งอีเมลกู้รหัสผ่านได้ กรุณาลองใหม่' };
  }

  return { error: null, success: 'ส่งลิงก์กู้รหัสผ่านไปที่อีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย' };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!password || !confirmPassword) {
    return { error: 'กรุณากรอกรหัสผ่านใหม่ทั้งสองช่อง' };
  }
  if (password.length < 8) {
    return { error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
  }
  if (password !== confirmPassword) {
    return { error: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: 'ไม่สามารถเปลี่ยนรหัสผ่านได้ ลิงก์อาจหมดอายุ กรุณาขอลิงก์ใหม่' };
  }

  return { error: null, success: 'เปลี่ยนรหัสผ่านสำเร็จ! กำลังนำคุณไปหน้าแรก...' };
}
