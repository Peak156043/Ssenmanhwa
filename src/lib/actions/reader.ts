'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

/**
 * Called when a logged-in reader opens a chapter. No-ops silently for
 * logged-out readers (per spec: reading never requires an account; history
 * is only saved for those who are signed in).
 */
export async function recordChapterReadAction(
  manhwaId: string,
  manhwaSlug: string,
  chapterId: string,
  chapterNumber: number,
) {
  const supabase = await createClient();
  // Record anonymous view for stats aggregation (works for logged out users too)
  await (supabase as any).from('manhwa_views_log').insert({ manhwa_id: manhwaId });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) return;

  await (supabase as any).from('chapter_reads').upsert(
    { user_id: user.id, chapter_id: chapterId, read_at: new Date().toISOString() },
    { onConflict: 'user_id,chapter_id' },
  );

  // Only advance reading_history if this chapter is further than what's
  // already recorded — re-reading an earlier chapter shouldn't roll the
  // "continue reading" position backwards.
  const { data: existing } = await supabase
    .from('reading_history')
    .select('last_chapter_number')
    .eq('user_id', user.id)
    .eq('manhwa_id', manhwaId)
    .maybeSingle();

  if (!existing || chapterNumber >= (existing as any).last_chapter_number) {
    await (supabase as any).from('reading_history').upsert(
      {
        user_id: user.id,
        manhwa_id: manhwaId,
        last_chapter_number: chapterNumber,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,manhwa_id' },
    );
  }

  revalidatePath('/dashboard');
  revalidatePath(`/manhwa/${manhwaSlug}`);
  revalidatePath('/');
}

export async function toggleBookmarkAction(manhwaId: string, manhwaSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'กรุณาเข้าสู่ระบบก่อนบันทึกเรื่องโปรด', bookmarked: false };
  }

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('manhwa_id', manhwaId)
    .maybeSingle();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('manhwa_id', manhwaId);
    revalidatePath('/bookmarks');
    revalidatePath(`/manhwa/${manhwaSlug}`);
    return { error: null, bookmarked: false };
  }

  await (supabase as any).from('bookmarks').insert({ user_id: user.id, manhwa_id: manhwaId });
  revalidatePath('/bookmarks');
  revalidatePath(`/manhwa/${manhwaSlug}`);
  return { error: null, bookmarked: true };
}
