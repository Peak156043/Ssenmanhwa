'use client';

import { useState, useRef } from 'react';
import { updateProfile, uploadAvatar } from '@/lib/actions/profile';
import { User, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { compressImageToWebP } from '@/lib/utils/imageCompression';

interface ProfileFormProps {
  initialData: {
    username: string;
    bio: string | null;
    avatar_url: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [username, setUsername] = useState(initialData.username);
  const [bio, setBio] = useState(initialData.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/png') && !file.type.startsWith('image/webp')) {
      setError('รองรับเฉพาะไฟล์ JPG, PNG และ WEBP เท่านั้น');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    const formData = new FormData();
    try {
      const compressedFile = await compressImageToWebP(file, 400); // 400px width for avatar
      formData.append('avatar', compressedFile);
    } catch (err) {
      console.error('Avatar compression error', err);
      formData.append('avatar', file); // Fallback to original
    }

    try {
      const result = await uploadAvatar(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.avatarUrl) {
        setAvatarUrl(result.avatarUrl);
        setSuccess('อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);

    try {
      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/50 p-6">
      <h2 className="text-xl font-display text-paper-100">ข้อมูลโปรไฟล์</h2>
      <p className="mt-1 text-sm text-paper-400">จัดการรูปโปรไฟล์ ชื่อผู้ใช้งาน และคำอธิบายตัวคุณ</p>

      {error && (
        <div className="mt-4 rounded bg-danger-500/10 p-3 text-sm text-danger-500 border border-danger-500/20">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded bg-emerald-500/10 p-3 text-sm text-emerald-500 border border-emerald-500/20">
          {success}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-ink-600 bg-ink-800">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={128} height={128} className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-paper-400" />
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-900/60 backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 rounded bg-ink-700 px-4 py-2 text-sm font-medium text-paper-200 hover:bg-ink-600 disabled:opacity-50"
          >
            <ImageIcon className="h-4 w-4" />
            เปลี่ยนรูปภาพ
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
          />
          <p className="text-center text-xs text-paper-500">
            JPG, PNG, WEBP<br />ขนาดไม่เกิน 10MB
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="flex-1 space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-paper-200">
              ชื่อผู้ใช้ (Username)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-paper-100 placeholder:text-paper-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              required
              minLength={3}
            />
          </div>

          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-paper-200">
              คำอธิบายตัวเอง (Bio)
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="แนะนำตัวคุณสั้นๆ..."
              className="w-full resize-y rounded border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-paper-100 placeholder:text-paper-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                'บันทึกข้อมูล'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
