'use client';

import { Button } from '@/components/ui/Button';
import { FieldLabel, Input } from '@/components/ui/Input';
import { useState, useRef, useTransition } from 'react';
import { UploadCloud, GripVertical, X, ArrowDownAZ } from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { createChapterAction, type ChapterFormState } from '@/lib/actions/chapters';
import { compressImageToWebP } from '@/lib/utils/imageCompression';
import { createClient } from '@/lib/supabase/client';

interface PageFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
}

export function ChapterUploadForm({ manhwaId, manhwaSlug }: { manhwaId: string; manhwaSlug: string }) {
  const [pages, setPages] = useState<PageFile[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [publishNow, setPublishNow] = useState(false);
  const [pending, startTransition] = useTransition();
  const [isCompressing, setIsCompressing] = useState(false);
  const [state, setState] = useState<ChapterFormState>({ error: null });
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);

    // Auto-sort by filename (e.g. 01.jpg, 02.jpg, ... 10.jpg) using natural
    // numeric ordering so "10.jpg" doesn't sort before "2.jpg".
    files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
    );

    const newPages: PageFile[] = files.map((file, i) => ({
      id: `${Date.now()}-${i}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));
    setPages((prev) => [...prev, ...newPages]);
  }

  function removePage(id: string) {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  function resortByFilename() {
    setPages((prev) =>
      [...prev].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
      ),
    );
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;

    setIsCompressing(true);

    try {
      const formData = new FormData(formRef.current);
      const chapterNumber = String(formData.get('chapterNumber'));
      
      // Compress all pages in parallel before uploading
      const compressedPages = await Promise.all(
        pages.map(async (p) => {
          // Max 10MB per image, quality 90%, no dimension restrictions
          const compressedFile = await compressImageToWebP(p.file, { maxSizeMB: 10, quality: 0.9 });
          return { originalName: p.file.name, file: compressedFile };
        })
      );

      // Upload directly to Supabase from the browser
      const supabase = createClient();
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < compressedPages.length; i++) {
        const file = compressedPages[i].file;
        const ext = file.name.split('.').pop() || 'webp';
        const pageNumber = String(i + 1).padStart(3, '0');
        const path = `${manhwaSlug}/ch${chapterNumber}/${pageNumber}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('manhwa-pages')
          .upload(path, file, { contentType: file.type, upsert: true });

        if (uploadError) {
          throw new Error(`อัปโหลดหน้า ${i + 1} ไม่สำเร็จ: ${uploadError.message}`);
        }

        const { data: publicUrl } = supabase.storage.from('manhwa-pages').getPublicUrl(path);
        uploadedUrls.push(publicUrl.publicUrl);
      }

      // Append URLs to FormData for the Server Action
      formData.append('pageUrls', JSON.stringify(uploadedUrls));

      startTransition(async () => {
        const result = await createChapterAction(manhwaId, manhwaSlug, state, formData);
        if (result?.error) setState(result);
        setIsCompressing(false);
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      setState({ error: err.message || 'เกิดข้อผิดพลาดขณะอัปโหลดภาพ กรุณาลองใหม่' });
      setIsCompressing(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {state.error && (
        <p className="rounded border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-400">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel htmlFor="chapterNumber">เลขตอน</FieldLabel>
          <Input id="chapterNumber" name="chapterNumber" type="number" step="0.5" required placeholder="เช่น 1 หรือ 2.5" />
        </div>
        <div>
          <FieldLabel htmlFor="chapterTitle">ชื่อตอน</FieldLabel>
          <Input id="chapterTitle" name="title" required placeholder="เช่น จุดเริ่มต้นใหม่" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <FieldLabel className="mb-0">รูปภาพเนื้อหา ({pages.length} หน้า)</FieldLabel>
          {pages.length > 0 && (
            <button
              type="button"
              onClick={resortByFilename}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-paper-400 hover:bg-ink-700 hover:text-paper-200"
            >
              <ArrowDownAZ className="h-3.5 w-3.5" />
              จัดเรียงตามชื่อไฟล์
            </button>
          )}
        </div>

        <label
          className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-ink-500 bg-ink-800 px-6 py-8 text-paper-500 hover:border-violet-500 hover:text-paper-300"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFilesSelected(e.dataTransfer.files);
          }}
        >
          <UploadCloud className="h-8 w-8" />
          <span className="text-sm">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกหลายไฟล์</span>
          <span className="text-xs text-paper-500">
            รองรับ .jpg .png .webp — เลือกได้พร้อมกันหลายไฟล์ ระบบจะจัดเรียงตามชื่อไฟล์ให้อัตโนมัติ
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
        </label>

        {pages.length > 0 && (
          <p className="mt-2 text-xs text-paper-500">
            ลากเพื่อสลับลำดับหน้าด้วยตนเอง หรือกด &ldquo;จัดเรียงตามชื่อไฟล์&rdquo; ด้านบน
          </p>
        )}

        {pages.length > 0 && (
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {pages.map((page, index) => (
              <li
                key={page.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={clsx(
                  'group relative aspect-[2/3] cursor-grab overflow-hidden rounded-sm border-2 bg-ink-700 active:cursor-grabbing',
                  dragIndex === index ? 'border-violet-500' : 'border-transparent',
                )}
              >
                <Image src={page.previewUrl} alt={page.name} fill className="object-cover" />
                <div className="absolute left-1 top-1 flex items-center gap-1 rounded-sm bg-ink-950/80 px-1.5 py-0.5 font-mono text-[10px] text-paper-200">
                  <GripVertical className="h-3 w-3" />
                  {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removePage(page.id)}
                  className="absolute right-1 top-1 rounded-full bg-ink-950/80 p-1 text-paper-300 opacity-0 hover:text-danger-400 group-hover:opacity-100"
                  aria-label={`ลบหน้า ${index + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="absolute bottom-0 left-0 right-0 truncate bg-ink-950/80 px-1 py-0.5 text-[9px] text-paper-400">
                  {page.name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-md border border-ink-700 bg-ink-800/60 p-4">
        <input
          id="publishNow"
          name="publishNow"
          type="checkbox"
          checked={publishNow}
          onChange={(e) => setPublishNow(e.target.checked)}
          className="h-4 w-4 rounded border-ink-500 bg-ink-800 text-violet-500 focus:ring-violet-500"
        />
        <label htmlFor="publishNow" className="flex-1 text-sm">
          <span className="font-medium text-paper-100">เผยแพร่ทันที (Publish)</span>
          <p className="text-xs text-paper-500">
            ถ้าไม่เปิด ตอนนี้จะถูกบันทึกเป็น Draft — ผู้อ่านจะยังไม่เห็นจนกว่าจะเปิดเผยแพร่
          </p>
        </label>
        <span
          className={clsx(
            'rounded-sm px-2 py-1 text-xs font-medium',
            publishNow ? 'bg-violet-500/15 text-violet-400' : 'bg-amber-500/15 text-amber-400',
          )}
        >
          {publishNow ? 'Publish' : 'Draft'}
        </span>
      </div>

      <div className="flex justify-end gap-3 border-t border-ink-700 pt-5">
        <Button type="button" variant="secondary" onClick={() => history.back()} disabled={pending || isCompressing}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={pending || isCompressing || pages.length === 0}>
          {isCompressing ? 'กำลังเตรียมไฟล์และอัปโหลด...' : pending ? 'กำลังบันทึกข้อมูล...' : publishNow ? 'บันทึกและเผยแพร่' : 'บันทึกเป็น Draft'}
        </Button>
      </div>
    </form>
  );
}
