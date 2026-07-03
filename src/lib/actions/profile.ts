'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

export async function updateProfile(formData: FormData) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
  }

  const username = formData.get('username') as string;
  const bio = formData.get('bio') as string;

  if (!username || username.trim().length < 3) {
    return { error: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' };
  }

  const supabase = await createClient();

  // Check if username is taken by someone else
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .ilike('username', username.trim())
    .neq('id', session.authUser.id)
    .maybeSingle();

  if (existingUser) {
    return { error: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว' };
  }

  const { error } = await supabase
    .from('users')
    // @ts-ignore - TS infers never due to recursive generic limitations
    .update({ 
      username: username.trim(),
      bio: bio ? bio.trim() : null
    })
    .eq('id', session.authUser.id);

  if (error) {
    console.error('Error updating profile:', error);
    return { error: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' };
  }

  revalidatePath('/profile');
  revalidatePath('/'); // to update header
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
  }

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 6) {
    return { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
  }

  if (password !== confirmPassword) {
    return { error: 'รหัสผ่านไม่ตรงกัน' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    console.error('Error updating password:', error);
    return { error: error.message };
  }

  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
  }

  const file = formData.get('avatar') as File;
  if (!file || file.size === 0) {
    return { error: 'กรุณาเลือกไฟล์รูปภาพ' };
  }

  // File size check (e.g. 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'ขนาดไฟล์ต้องไม่เกิน 10MB' };
  }

  // Type check
  if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/png') && !file.type.startsWith('image/webp')) {
    return { error: 'รองรับเฉพาะไฟล์ JPG, PNG และ WEBP เท่านั้น' };
  }

  const supabase = await createClient();
  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  const filePath = `${session.authUser.id}/${Date.now()}.${ext}`;

  // Upload to avatars bucket
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return { error: 'อัปโหลดรูปล้มเหลว' };
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  // Update user profile
  const { error: updateError } = await supabase
    .from('users')
    // @ts-ignore
    .update({ avatar_url: publicUrl })
    .eq('id', session.authUser.id);

  if (updateError) {
    console.error('Error updating avatar url:', updateError);
    return { error: 'บันทึกรูปโปรไฟล์ล้มเหลว' };
  }

  revalidatePath('/profile');
  revalidatePath('/'); // Update header
  return { success: true, avatarUrl: publicUrl };
}
