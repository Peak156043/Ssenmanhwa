'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface ManhwaFormState {
  error: string | null;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function createManhwaAction(
  _prevState: ManhwaFormState,
  formData: FormData,
): Promise<ManhwaFormState> {
  const { authUser } = await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get('title') ?? '').trim();
  const synopsis = String(formData.get('synopsis') ?? '').trim();
  const status = String(formData.get('status') ?? 'ongoing');
  const slugInput = String(formData.get('slug') ?? '').trim();
  const genreIds = formData.getAll('genreIds').map(String);
  const coverFile = formData.get('cover') as File | null;

  if (!title || !synopsis) {
    return { error: 'กรุณากรอกชื่อเรื่องและเรื่องย่อ' };
  }

  const slug = slugInput ? slugify(slugInput) : slugify(title);

  let coverImageUrl: string | null = null;
  if (coverFile && coverFile.size > 0) {
    if (coverFile.size > 5 * 1024 * 1024) {
      return { error: 'รูปปกต้องมีขนาดไม่เกิน 5MB' };
    }
    const ext = coverFile.name.split('.').pop();
    const path = `${slug}/${Date.now()}-cover.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('manhwa-covers')
      .upload(path, coverFile, { contentType: coverFile.type, upsert: false });

    if (uploadError) {
      return { error: 'อัปโหลดรูปปกไม่สำเร็จ: ' + uploadError.message };
    }
    const { data: publicUrl } = supabase.storage.from('manhwa-covers').getPublicUrl(path);
    coverImageUrl = publicUrl.publicUrl;
  }

  const { data: manhwa, error: insertError } = await (supabase as any)
    .from('manhwa')
    .insert({
      slug,
      title,
      synopsis,
      status: status as 'ongoing' | 'completed' | 'hiatus',
      cover_image_url: coverImageUrl,
      created_by: authUser.id,
    })
    .select('id, slug')
    .single();

  if (insertError) {
    if (insertError.message.includes('duplicate')) {
      return { error: 'Slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน slug' };
    }
    return { error: 'สร้างเรื่องไม่สำเร็จ: ' + insertError.message };
  }

  if (genreIds.length > 0) {
    await (supabase as any)
      .from('manhwa_genres')
      .insert(genreIds.map((genreId) => ({ manhwa_id: manhwa.id, genre_id: genreId })));
  }

  revalidatePath('/admin/manhwa');
  revalidatePath('/');
  redirect(`/admin/manhwa/${manhwa.slug}`);
}

export async function updateManhwaAction(
  manhwaId: string,
  _prevState: ManhwaFormState,
  formData: FormData,
): Promise<ManhwaFormState> {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get('title') ?? '').trim();
  const synopsis = String(formData.get('synopsis') ?? '').trim();
  const status = String(formData.get('status') ?? 'ongoing');
  const slug = slugify(String(formData.get('slug') ?? ''));
  const genreIds = formData.getAll('genreIds').map(String);
  const coverFile = formData.get('cover') as File | null;

  if (!title || !synopsis || !slug) {
    return { error: 'กรุณากรอกข้อมูลให้ครบ' };
  }

  const updates: Record<string, unknown> = { title, synopsis, status, slug };

  if (coverFile && coverFile.size > 0) {
    if (coverFile.size > 5 * 1024 * 1024) {
      return { error: 'รูปปกต้องมีขนาดไม่เกิน 5MB' };
    }
    const ext = coverFile.name.split('.').pop();
    const path = `${slug}/${Date.now()}-cover.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('manhwa-covers')
      .upload(path, coverFile, { contentType: coverFile.type });

    if (uploadError) {
      return { error: 'อัปโหลดรูปปกไม่สำเร็จ: ' + uploadError.message };
    }
    const { data: publicUrl } = supabase.storage.from('manhwa-covers').getPublicUrl(path);
    updates.cover_image_url = publicUrl.publicUrl;
  }

  const { error: updateError } = await (supabase as any).from('manhwa').update(updates).eq('id', manhwaId);
  if (updateError) {
    return { error: 'บันทึกไม่สำเร็จ: ' + updateError.message };
  }

  // Replace genre associations wholesale — simplest correct approach for a
  // small admin form; fine at this scale since a manhwa has at most a
  // handful of genres.
  await (supabase as any).from('manhwa_genres').delete().eq('manhwa_id', manhwaId);
  if (genreIds.length > 0) {
    await (supabase as any)
      .from('manhwa_genres')
      .insert(genreIds.map((genreId) => ({ manhwa_id: manhwaId, genre_id: genreId })));
  }

  const chapterStatusesStr = formData.get('chapterStatuses') as string;
  if (chapterStatusesStr) {
    try {
      const chapterStatuses = JSON.parse(chapterStatusesStr);
      for (const [chapterId, status] of Object.entries(chapterStatuses)) {
        await (supabase as any).from('chapters').update({ status }).eq('id', chapterId);
      }
    } catch (e) {
      console.error('Failed to update chapter statuses', e);
    }
  }

  revalidatePath('/admin/manhwa');
  revalidatePath(`/manhwa/${slug}`);
  revalidatePath('/');
  return { error: null };
}

export async function deleteManhwaAction(manhwaId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from('manhwa').delete().eq('id', manhwaId);
  if (error) {
    return { error: 'ลบไม่สำเร็จ: ' + error.message };
  }

  revalidatePath('/admin/manhwa');
  revalidatePath('/');
  redirect('/admin/manhwa');
}
