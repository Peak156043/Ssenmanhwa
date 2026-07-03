'use client';

import { useState } from 'react';
import { updatePassword } from '@/lib/actions/profile';
import { KeyRound, Loader2 } from 'lucide-react';

export function PasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);

    try {
      const result = await updatePassword(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/50 p-6 mt-6">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound className="h-5 w-5 text-paper-100" />
        <h2 className="text-xl font-display text-paper-100">เปลี่ยนรหัสผ่าน</h2>
      </div>
      <p className="mb-6 text-sm text-paper-400">กำหนดรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชี</p>

      {error && (
        <div className="mb-4 rounded bg-danger-500/10 p-3 text-sm text-danger-500 border border-danger-500/20">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded bg-emerald-500/10 p-3 text-sm text-emerald-500 border border-emerald-500/20">
          {success}
        </div>
      )}

      <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-paper-200">
            รหัสผ่านใหม่
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-paper-100 placeholder:text-paper-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            required
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-paper-200">
            ยืนยันรหัสผ่านใหม่
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-paper-100 placeholder:text-paper-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            required
            minLength={6}
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
              'เปลี่ยนรหัสผ่าน'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
