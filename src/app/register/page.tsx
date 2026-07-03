'use client';

import { AuthCard } from '@/components/layout/AuthCard';
import { Button } from '@/components/ui/Button';
import { FieldLabel, Input } from '@/components/ui/Input';
import { Mail, Lock, User } from 'lucide-react';
import { useActionState } from 'react';
import { signUpAction, type AuthActionState } from '@/lib/actions/auth';

const initialState: AuthActionState = { error: null };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <AuthCard
      title="สมัครสมาชิก"
      subtitle="สร้างบัญชีเพื่อเริ่มบันทึกเรื่องที่อ่านและติดตามตอนใหม่"
      footerText="มีบัญชีอยู่แล้ว?"
      footerLinkText="เข้าสู่ระบบ"
      footerLinkHref="/login"
    >
      <form action={formAction} className="space-y-4">
        {state.error && (
          <p className="rounded border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-400">
            {state.error}
          </p>
        )}
        <div>
          <FieldLabel htmlFor="username">ชื่อผู้ใช้</FieldLabel>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
            <Input id="username" name="username" required placeholder="นักอ่านมังฮวา99" className="pl-9" />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="email">อีเมล</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
            <Input id="email" name="email" type="email" required placeholder="you@example.com" className="pl-9" />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="password">รหัสผ่าน</FieldLabel>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="อย่างน้อย 8 ตัวอักษร"
              className="pl-9"
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
        </Button>
      </form>
    </AuthCard>
  );
}
