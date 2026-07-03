'use client';

import { useState, useTransition } from 'react';
import { Genre } from '@/types';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { createGenreAction, updateGenreAction, deleteGenreAction } from '@/lib/actions/genres';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface GenreManagerProps {
  initialGenres: Genre[];
}

export function GenreManager({ initialGenres }: GenreManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  
  const [modalState, setModalState] = useState<{ isOpen: boolean; targetId: string | null; targetName: string }>({ isOpen: false, targetId: null, targetName: '' });

  const handleCreate = async () => {
    if (!newName) return;
    setErrorMsg('');
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', newName);
      formData.append('slug', newSlug);
      
      const { error } = await createGenreAction(formData);
      if (error) {
        setErrorMsg(error);
      } else {
        setIsAdding(false);
        setNewName('');
        setNewSlug('');
      }
    });
  };

  const handleUpdate = async (id: string) => {
    if (!editName) return;
    setErrorMsg('');
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('slug', editSlug);
      
      const { error } = await updateGenreAction(id, formData);
      if (error) {
        setErrorMsg(error);
      } else {
        setEditingId(null);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    setModalState({ isOpen: true, targetId: id, targetName: name });
  };

  const confirmDelete = async () => {
    if (!modalState.targetId) return;
    
    setErrorMsg('');
    startTransition(async () => {
      const { error } = await deleteGenreAction(modalState.targetId!);
      if (error) {
        setErrorMsg(error);
      }
      setModalState({ isOpen: false, targetId: null, targetName: '' });
    });
  };

  const startEditing = (genre: Genre) => {
    setEditingId(genre.id);
    setEditName(genre.name);
    setEditSlug(genre.slug);
  };

  return (
    <div className="space-y-4">
      <ConfirmModal
        isOpen={modalState.isOpen}
        title="ยืนยันการลบแท็ก"
        description={`คุณแน่ใจหรือไม่ที่จะลบแท็ก "${modalState.targetName}"?\nมังฮวาที่มีแท็กนี้จะถูกนำแท็กออกโดยอัตโนมัติ`}
        confirmText="ลบถาวร"
        isLoading={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setModalState({ isOpen: false, targetId: null, targetName: '' })}
      />
      {errorMsg && (
        <div className="rounded bg-danger-500/10 p-3 text-sm text-danger-400">
          {errorMsg}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-paper-200">แท็กทั้งหมด ({initialGenres.length})</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="flex gap-1.5" disabled={isPending}>
            <Plus className="h-4 w-4" />
            เพิ่มแท็กใหม่
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-ink-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-800/60 text-left text-paper-400 border-b border-ink-700">
            <tr>
              <th className="px-4 py-3 font-medium">ชื่อแท็ก</th>
              <th className="px-4 py-3 font-medium">Slug (URL)</th>
              <th className="px-4 py-3 font-medium text-right w-40">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {isAdding && (
              <tr className="bg-ink-800/20">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="เช่น ฮาเร็ม"
                    className="w-full rounded border border-ink-600 bg-ink-900 px-2 py-1.5 text-paper-100 focus:border-violet-500 focus:outline-none"
                    disabled={isPending}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="ปล่อยว่างเพื่อสร้างอัตโนมัติ"
                    className="w-full rounded border border-ink-600 bg-ink-900 px-2 py-1.5 text-paper-100 focus:border-violet-500 focus:outline-none"
                    disabled={isPending}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAdding(false)}
                      className="rounded p-1.5 text-paper-400 hover:bg-ink-700 hover:text-paper-100"
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCreate}
                      className="rounded p-1.5 text-success-400 hover:bg-success-500/10"
                      disabled={isPending || !newName}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {initialGenres.map((genre) => (
              <tr key={genre.id} className="hover:bg-ink-800/40">
                {editingId === genre.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded border border-ink-600 bg-ink-900 px-2 py-1.5 text-paper-100 focus:border-violet-500 focus:outline-none"
                        disabled={isPending}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="w-full rounded border border-ink-600 bg-ink-900 px-2 py-1.5 text-paper-100 focus:border-violet-500 focus:outline-none"
                        disabled={isPending}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded p-1.5 text-paper-400 hover:bg-ink-700 hover:text-paper-100"
                          disabled={isPending}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdate(genre.id)}
                          className="rounded p-1.5 text-success-400 hover:bg-success-500/10"
                          disabled={isPending || !editName}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-paper-100">{genre.name}</td>
                    <td className="px-4 py-3 text-paper-400 font-mono text-xs">{genre.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEditing(genre)}
                          className="rounded p-1.5 text-paper-400 hover:bg-ink-700 hover:text-paper-100"
                          disabled={isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(genre.id, genre.name)}
                          className="rounded p-1.5 text-danger-400 hover:bg-danger-500/10 hover:text-danger-300"
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {initialGenres.length === 0 && !isAdding && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-paper-400">
                  ไม่มีแท็กในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
