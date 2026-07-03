'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function createGenreAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get('name') ?? '').trim();
  const slugInput = String(formData.get('slug') ?? '').trim();

  if (!name) {
    return { error: 'กรุณากรอกชื่อแท็ก' };
  }

  const slug = slugInput ? slugify(slugInput) : slugify(name);

  const { error } = await (supabase as any).from('genres').insert({ name, slug });
  
  if (error) {
    if (error.message.includes('duplicate')) {
      return { error: 'มีแท็กหรือ Slug นี้อยู่ในระบบแล้ว' };
    }
    return { error: 'ไม่สามารถสร้างแท็กได้: ' + error.message };
  }

  revalidatePath('/admin/genres');
  revalidatePath('/admin/manhwa/new');
  revalidatePath('/admin/manhwa');
  revalidatePath('/');
  return { error: null };
}

export async function updateGenreAction(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get('name') ?? '').trim();
  const slugInput = String(formData.get('slug') ?? '').trim();

  if (!name) {
    return { error: 'กรุณากรอกชื่อแท็ก' };
  }

  const slug = slugInput ? slugify(slugInput) : slugify(name);

  const { error } = await (supabase as any).from('genres').update({ name, slug }).eq('id', id);

  if (error) {
    if (error.message.includes('duplicate')) {
      return { error: 'มีแท็กหรือ Slug นี้อยู่ในระบบแล้ว' };
    }
    return { error: 'ไม่สามารถแก้ไขแท็กได้: ' + error.message };
  }

  revalidatePath('/admin/genres');
  revalidatePath('/admin/manhwa/new');
  revalidatePath('/admin/manhwa');
  revalidatePath('/');
  return { error: null };
}

export async function deleteGenreAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await (supabase as any).from('genres').delete().eq('id', id);

  if (error) {
    return { error: 'ไม่สามารถลบแท็กได้: ' + error.message };
  }

  revalidatePath('/admin/genres');
  revalidatePath('/admin/manhwa/new');
  revalidatePath('/admin/manhwa');
  revalidatePath('/');
  return { error: null };
}
