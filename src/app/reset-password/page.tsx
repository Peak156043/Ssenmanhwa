'use client';

import { AuthCard } from '@/components/layout/AuthCard';
import { Button } from '@/components/ui/Button';
import { FieldLabel, Input } from '@/components/ui/Input';
import { Lock, CheckCircle } from 'lucide-react';
import { useActionState } from 'react';
import { resetPasswordAction, type AuthActionState } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const initialState: AuthActionState = { error: null };

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => router.push('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <AuthCard
      title="ตั้งรหัสผ่านใหม่"
      subtitle="กรอกรหัสผ่านใหม่ที่ต้องการใช้"
      footerText="กลับไปหน้า"
      footerLinkText="เข้าสู่ระบบ"
      footerLinkHref="/login"
    >
      {state.success ? (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-green-400" />
          <p className="mt-3 text-sm text-green-300">{state.success}</p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {state.error && (
            <p className="rounded border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-400">
              {state.error}
            </p>
          )}
          <div>
            <FieldLabel htmlFor="password">รหัสผ่านใหม่</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
              <Input id="password" name="password" type="password" required placeholder="อย่างน้อย 8 ตัวอักษร" className="pl-9" />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
              <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder="กรอกรหัสผ่านอีกครั้ง" className="pl-9" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
