'use client';

import { AuthCard } from '@/components/layout/AuthCard';
import { Button } from '@/components/ui/Button';
import { FieldLabel, Input } from '@/components/ui/Input';
import { Mail, CheckCircle } from 'lucide-react';
import { useActionState } from 'react';
import { forgotPasswordAction, type AuthActionState } from '@/lib/actions/auth';

const initialState: AuthActionState = { error: null };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <AuthCard
      title="ลืมรหัสผ่าน"
      subtitle="กรอกอีเมลที่ใช้สมัครสมาชิก แล้วเราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้คุณ"
      footerText="จำรหัสผ่านได้แล้ว?"
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
            <FieldLabel htmlFor="email">อีเมล</FieldLabel>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
              <Input id="email" name="email" type="email" required placeholder="you@example.com" className="pl-9" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'กำลังส่ง...' : 'ส่งลิงก์กู้รหัสผ่าน'}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
