'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface ChapterFormState {
  error: string | null;
}

export async function createChapterAction(
  manhwaId: string,
  manhwaSlug: string,
  _prevState: ChapterFormState,
  formData: FormData,
): Promise<ChapterFormState> {
  const { authUser } = await requireAdmin();
  const supabase = await createClient();

  const chapterNumber = Number(formData.get('chapterNumber'));
  const title = String(formData.get('title') ?? '').trim();
  const publishNow = formData.get('publishNow') === 'on';
  const pageFiles = formData.getAll('pages') as File[];

  if (!chapterNumber || Number.isNaN(chapterNumber)) {
    return { error: 'กรุณากรอกเลขตอนให้ถูกต้อง' };
  }
  if (!title) {
    return { error: 'กรุณากรอกชื่อตอน' };
  }
  if (pageFiles.length === 0 || pageFiles.every((f) => f.size === 0)) {
    return { error: 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 หน้า' };
  }

  // Files arrive in the order the client already sorted/reordered them
  // (FormData preserves append order), so the upload index here IS the
  // final page order — no separate "order" field needed.
  const uploadedUrls: string[] = [];
  for (let i = 0; i < pageFiles.length; i++) {
    const file = pageFiles[i];
    if (file.size === 0) continue;
    if (file.size > 10 * 1024 * 1024) {
      return { error: `ไฟล์ ${file.name} มีขนาดเกิน 10MB` };
    }

    const ext = file.name.split('.').pop();
    const pageNumber = String(i + 1).padStart(3, '0');
    const path = `${manhwaSlug}/ch${chapterNumber}/${pageNumber}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('manhwa-pages')
      .upload(path, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      return { error: `อัปโหลดหน้า ${i + 1} ไม่สำเร็จ: ${uploadError.message}` };
    }

    const { data: publicUrl } = supabase.storage.from('manhwa-pages').getPublicUrl(path);
    uploadedUrls.push(publicUrl.publicUrl);
  }

  const { error: insertError } = await (supabase as any).from('chapters').insert({
    manhwa_id: manhwaId,
    chapter_number: chapterNumber,
    title,
    status: publishNow ? 'published' : 'draft',
    page_image_urls: uploadedUrls,
    created_by: authUser.id,
    published_at: publishNow ? new Date().toISOString() : null,
  });

  if (insertError) {
    if (insertError.message.includes('duplicate')) {
      return { error: `ตอนที่ ${chapterNumber} มีอยู่แล้วในเรื่องนี้` };
    }
    return { error: 'บันทึกตอนไม่สำเร็จ: ' + insertError.message };
  }

  revalidatePath(`/admin/manhwa/${manhwaSlug}`);
  revalidatePath(`/manhwa/${manhwaSlug}`);
  redirect(`/admin/manhwa/${manhwaSlug}`);
}

export async function toggleChapterStatusAction(chapterId: string, manhwaSlug: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: chapter } = await supabase
    .from('chapters')
    .select('status')
    .eq('id', chapterId)
    .single();

  if (!chapter) return { error: 'ไม่พบตอนนี้' };

  const nextStatus = (chapter as any).status === 'draft' ? 'published' : 'draft';
  const { error } = await (supabase as any)
    .from('chapters')
    .update({
      status: nextStatus,
      published_at: nextStatus === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', chapterId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/manhwa/${manhwaSlug}`);
  revalidatePath(`/manhwa/${manhwaSlug}`);
  return { error: null };
}

export async function deleteChapterAction(chapterId: string, manhwaSlug: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/manhwa/${manhwaSlug}`);
  revalidatePath(`/manhwa/${manhwaSlug}`);
  return { error: null };
}
