'use client';

import { Manhwa, ManhwaStatus, Genre, Chapter } from '@/types';
import { Button } from '@/components/ui/Button';
import { FieldLabel, Input, Select, Textarea } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useState, useActionState, useEffect, useRef } from 'react';
import { UploadCloud, Trash2 } from 'lucide-react';
import Image from 'next/image';
import {
  createManhwaAction,
  updateManhwaAction,
  deleteManhwaAction,
  type ManhwaFormState,
} from '@/lib/actions/manhwa';
import { clsx } from 'clsx';
import { compressImageToWebP } from '@/lib/utils/imageCompression';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface ManhwaFormProps {
  initial?: Partial<Manhwa> & { id?: string };
  mode: 'create' | 'edit';
  genres: Genre[];
  chapters?: Chapter[];
}

const initialState: ManhwaFormState = { error: null };

export function ManhwaForm({ initial, mode, genres, chapters = [] }: ManhwaFormProps) {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initial?.coverImageUrl ?? null,
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initial?.genres?.map((g) => g.id) ?? [],
  );
  const [chapterStatuses, setChapterStatuses] = useState<Record<string, 'draft' | 'published'>>(
    () => chapters.reduce((acc, c) => ({ ...acc, [c.id]: c.status }), {})
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const boundAction =
    mode === 'create'
      ? createManhwaAction
      : updateManhwaAction.bind(null, initial!.id!);

  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [isDirty, setIsDirty] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleAction = async (formData: FormData) => {
    const coverFile = formData.get('cover') as File | null;
    if (coverFile && coverFile.size > 0 && coverFile.name) {
      setIsCompressing(true);
      try {
        const compressed = await compressImageToWebP(coverFile, { maxWidthOrHeight: 800 }); // 800px width for cover is plenty
        formData.set('cover', compressed);
      } catch (err) {
        console.error('Cover compression failed:', err);
      }
      setIsCompressing(false);
    }
    formAction(formData);
  };

  const wasPending = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
    } else if (wasPending.current) {
      wasPending.current = false;
      if (state.error === null) {
        setIsDirty(false);
      }
    }
  }, [pending, state.error]);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setIsDirty(true);
  }

  function toggleGenre(id: string) {
    setSelectedGenres((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    setIsDirty(true);
  }

  function toggleChapterStatusLocal(id: string) {
    setChapterStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === 'draft' ? 'published' : 'draft',
    }));
    setIsDirty(true);
  }

  function handleDelete() {
    if (!initial?.id) return;
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!initial?.id) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteManhwaAction(initial.id);
    if (result?.error) {
      setDeleteError(result.error);
      setDeleting(false);
    }
    setDeleteModalOpen(false);
    // on success, deleteManhwaAction redirects server-side
  }

  return (
    <>
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="ยืนยันการลบมังฮวา"
        description={`คุณแน่ใจหรือไม่ที่จะลบเรื่อง "${initial?.title}"?\nการลบนี้จะลบตอนทั้งหมดและไม่สามารถกู้คืนได้`}
        confirmText="ลบถาวร"
        isLoading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
      <form action={handleAction} onChange={() => setIsDirty(true)} className="space-y-6">
      <input type="hidden" name="chapterStatuses" value={JSON.stringify(chapterStatuses)} />
      {state.error && (
        <p className="rounded border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-400">
          {state.error}
        </p>
      )}
      {deleteError && (
        <p className="rounded border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-400">
          {deleteError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
        <div>
          <FieldLabel>รูปปก</FieldLabel>
          <label className="relative flex aspect-[2/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-ink-500 bg-ink-800 text-paper-500 hover:border-violet-500 hover:text-paper-300">
            {coverPreview ? (
              <Image src={coverPreview} alt="ตัวอย่างรูปปก" fill className="rounded-md object-cover" />
            ) : (
              <>
                <UploadCloud className="h-8 w-8" />
                <span className="text-xs">อัปโหลดรูปปก</span>
              </>
            )}
            <input type="file" name="cover" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="title">ชื่อเรื่อง</FieldLabel>
            <Input id="title" name="title" required defaultValue={initial?.title} placeholder="เช่น เงาแห่งราชาผู้ล่วงลับ" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="status">สถานะ</FieldLabel>
              <Select id="status" name="status" defaultValue={initial?.status ?? 'ongoing'}>
                <option value="ongoing">กำลังอัพเดท</option>
                <option value="completed">จบแล้ว</option>
                <option value="hiatus">หยุดพัก</option>
              </Select>
            </div>
            <div>
              <FieldLabel htmlFor="slug">Slug (URL)</FieldLabel>
              <Input
                id="slug"
                name="slug"
                required
                defaultValue={initial?.slug}
                placeholder="shadow-of-the-fallen-king"
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="synopsis">เรื่องย่อ</FieldLabel>
            <Textarea id="synopsis" name="synopsis" required rows={4} defaultValue={initial?.synopsis} />
          </div>
        </div>
      </div>

      <div>
        <FieldLabel>หมวดหมู่ (เลือกได้หลายรายการ)</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <label key={g.id}>
              <input
                type="checkbox"
                name="genreIds"
                value={g.id}
                checked={selectedGenres.includes(g.id)}
                onChange={() => toggleGenre(g.id)}
                className="peer sr-only"
              />
              <span
                className={
                  selectedGenres.includes(g.id)
                    ? 'cursor-pointer rounded-sm border border-violet-500 bg-violet-500/15 px-3 py-1.5 text-sm text-violet-400'
                    : 'cursor-pointer rounded-sm border border-ink-500 bg-ink-800 px-3 py-1.5 text-sm text-paper-300 hover:border-ink-400'
                }
              >
                {g.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {mode === 'edit' && chapters.length > 0 && (
        <div className="border-t border-ink-700 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base text-paper-100">ตอนทั้งหมด ({chapters.length})</h2>
            <button
              type="button"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 px-2 py-1 rounded transition-colors"
            >
              เรียงลำดับ: {sortOrder === 'desc' ? 'Z-A (ใหม่ล่าสุดก่อน)' : 'A-Z (เก่าสุดก่อน)'}
            </button>
          </div>
          <div className="divide-y divide-ink-700 rounded-lg border border-ink-700 max-h-[880px] overflow-y-auto">
            {[...chapters].sort((a, b) => sortOrder === 'desc' ? b.chapterNumber - a.chapterNumber : a.chapterNumber - b.chapterNumber).map((c) => {
              const currentStatus = chapterStatuses[c.id] || c.status;
              return (
                <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-paper-300">#{c.chapterNumber}</span>
                    <span className="text-sm text-paper-100">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleChapterStatusLocal(c.id)}
                      className={clsx(
                        'rounded-sm px-2 py-0.5 text-xs transition-colors',
                        currentStatus === 'draft'
                          ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                          : 'bg-violet-500/15 text-violet-400 hover:bg-violet-500/25',
                      )}
                    >
                      {currentStatus === 'draft' ? 'ฉบับร่าง' : 'เผยแพร่'}
                    </button>
                    {/* เราไม่แสดงปุ่มลบในหน้านี้แล้ว เพื่อป้องกันความสับสน การลบจะทำได้ในหน้าแก้ไขตอน */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-ink-700 pt-5">
        {mode === 'edit' ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded border border-danger-500/40 px-4 py-2 text-sm text-danger-400 hover:bg-danger-500/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'กำลังลบ...' : 'ลบเรื่องนี้'}
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          {mode === 'create' && (
            <Button type="button" variant="secondary" onClick={() => router.push('/admin/manhwa')}>
              ยกเลิก
            </Button>
          )}
          <Button type="submit" disabled={pending || isCompressing || (mode === 'edit' && !isDirty)}>
            {isCompressing ? 'กำลังบีบอัดรูปปก...' : pending ? 'กำลังบันทึก...' : mode === 'create' ? 'สร้างเรื่องใหม่' : 'บันทึกการแก้ไข'}
          </Button>
        </div>
      </div>
    </form>
    </>
  );
}
