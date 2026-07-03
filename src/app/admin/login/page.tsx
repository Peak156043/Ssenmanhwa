'use client';

import { Button } from '@/components/ui/Button';
import { FieldLabel, Input } from '@/components/ui/Input';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { useActionState, Suspense } from 'react';
import { adminSignInAction } from '@/lib/actions/admin-auth';
import type { AuthActionState } from '@/lib/actions/auth';
import { useSearchParams } from 'next/navigation';

const initialState: AuthActionState = { error: null };

function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminSignInAction, initialState);
  const searchParams = useSearchParams();
  const redirectedError = searchParams.get('error') === 'not_admin'
    ? 'บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล'
    : null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-lg border border-ink-700 bg-ink-800/60 p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-violet-400" />
          <h1 className="font-display text-xl text-paper-100">Admin Login</h1>
        </div>
        <p className="mt-1 text-sm text-paper-500">
          สำหรับผู้ดูแลระบบเท่านั้น ใช้บัญชีเดียวกับผู้ใช้ทั่วไป แต่ต้องได้รับสิทธิ์แอดมินก่อน
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          {(state.error || redirectedError) && (
            <p className="rounded border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-400">
              {state.error || redirectedError}
            </p>
          )}
          <div>
            <FieldLabel htmlFor="admin-email">อีเมล</FieldLabel>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
              <Input id="admin-email" name="email" type="email" required placeholder="admin@example.com" className="pl-9" />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="admin-password">รหัสผ่าน</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
              <Input id="admin-password" name="password" type="password" required placeholder="••••••••" className="pl-9" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบผู้ดูแล'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
