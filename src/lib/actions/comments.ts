'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CommentState = {
  error: string | null;
  success?: boolean;
};

export async function addCommentAction(
  chapterId: string,
  content: string,
  pathname: string,
): Promise<CommentState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น' };
  }

  if (!content.trim()) {
    return { error: 'กรุณากรอกข้อความ' };
  }

  if (content.length > 1000) {
    return { error: 'ข้อความยาวเกินไป (สูงสุด 1,000 ตัวอักษร)' };
  }

  const { error } = await supabase.from('chapter_comments').insert({
    chapter_id: chapterId,
    user_id: user.id,
    content: content.trim(),
  } as any);

  if (error) {
    console.error('Failed to add comment:', error);
    return { error: 'เกิดข้อผิดพลาดในการส่งคอมเมนต์' };
  }

  revalidatePath(pathname);
  return { error: null, success: true };
}

export async function deleteCommentAction(
  commentId: string,
  pathname: string,
): Promise<CommentState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  // RLS will enforce that only the owner or an admin can delete it
  const { error } = await supabase
    .from('chapter_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Failed to delete comment:', error);
    return { error: 'ลบคอมเมนต์ไม่สำเร็จ' };
  }

  revalidatePath(pathname);
  return { error: null, success: true };
}
