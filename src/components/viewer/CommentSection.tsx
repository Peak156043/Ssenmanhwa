'use client';

import { useState, useTransition } from 'react';
import { User, Send, Trash2, Loader2, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { addCommentAction, deleteCommentAction } from '@/lib/actions/comments';
import { type CommentWithUser } from '@/lib/queries/manhwa';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface CommentSectionProps {
  chapterId: string;
  comments: CommentWithUser[];
  currentUserId?: string | null;
  isAdmin?: boolean;
  manhwaSlug: string; // for login redirect
}

export function CommentSection({ chapterId, comments, currentUserId, isAdmin = false, manhwaSlug }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  // Modal state for delete confirmation
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    targetId: string | null;
  }>({ isOpen: false, targetId: null });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await addCommentAction(chapterId, content, window.location.pathname);
      if (result.error) {
        setError(result.error);
      } else {
        setContent(''); // Clear on success
      }
    });
  };

  const confirmDelete = () => {
    if (!modalState.targetId) return;
    
    startTransition(async () => {
      const result = await deleteCommentAction(modalState.targetId!, window.location.pathname);
      if (result.error) {
        alert(result.error);
      } else {
        setModalState({ isOpen: false, targetId: null });
      }
    });
  };

  return (
    <div className="mx-auto mt-12 max-w-3xl px-4 pb-16">
      <ConfirmModal
        isOpen={modalState.isOpen}
        title="ยืนยันการลบคอมเมนต์"
        description="คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้"
        confirmText="ลบคอมเมนต์"
        isLoading={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setModalState({ isOpen: false, targetId: null })}
      />
      <div className="mb-6 flex items-center gap-2 border-b border-ink-800 pb-4">
        <MessageSquare className="h-5 w-5 text-paper-300" />
        <h2 className="font-display text-xl text-paper-100">ความคิดเห็น ({comments.length})</h2>
      </div>

      {error && (
        <div className="mb-4 rounded bg-danger-500/10 p-3 text-sm text-danger-500 border border-danger-500/20">
          {error}
        </div>
      )}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
            placeholder="แสดงความคิดเห็นเกี่ยวกับตอนนี้..."
            className="w-full resize-y rounded-lg border border-ink-700 bg-ink-900/50 p-4 text-sm text-paper-200 placeholder:text-paper-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            rows={3}
            maxLength={1000}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending || !content.trim()}
              className="flex items-center gap-2 rounded-md bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              ส่งข้อความ
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-lg border border-ink-700 bg-ink-900/50 py-8 text-center">
          <p className="mb-4 text-sm text-paper-400">กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
          <Link
            href={`/login?next=/manhwa/${manhwaSlug}`}
            className="inline-flex items-center justify-center rounded-md bg-violet-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-sm text-paper-500 py-10">ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นสิ!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group flex gap-4">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-ink-700 bg-ink-800">
                {comment.user.avatar_url ? (
                  <Image src={comment.user.avatar_url} alt={comment.user.username} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-5 w-5 text-paper-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-paper-200">{comment.user.username}</span>
                    <span className="text-xs text-paper-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: th })}
                    </span>
                  </div>
                  {(currentUserId === comment.user.id || isAdmin) && (
                    <button
                      onClick={() => setModalState({ isOpen: true, targetId: comment.id })}
                      disabled={isPending}
                      className="text-paper-500 opacity-0 transition-opacity hover:text-danger-400 group-hover:opacity-100 disabled:opacity-0"
                      title={currentUserId === comment.user.id ? "ลบคอมเมนต์" : "ลบคอมเมนต์ (ในฐานะผู้ดูแล)"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-paper-300">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
