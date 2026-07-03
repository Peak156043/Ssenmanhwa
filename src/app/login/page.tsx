'use client';

import { AuthCard } from '@/components/layout/AuthCard';
import { Button } from '@/components/ui/Button';
import { FieldLabel, Input } from '@/components/ui/Input';
import { Mail, Lock } from 'lucide-react';
import { useActionState } from 'react';
import { signInAction, signInWithGoogleAction, type AuthActionState } from '@/lib/actions/auth';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const initialState: AuthActionState = { error: null };

function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  let externalError: string | null = null;
  if (errorParam === 'banned') externalError = 'บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ';
  if (errorParam === 'auth_failed') externalError = 'การเข้าสู่ระบบผ่าน Google ไม่สำเร็จ กรุณาลองใหม่';
  if (errorParam === 'session_expired') externalError = 'เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง';

  return (
    <AuthCard
      title="เข้าสู่ระบบ"
      subtitle="เข้าสู่ระบบเพื่อบันทึกประวัติการอ่านและเรื่องโปรดของคุณ"
      footerText="ยังไม่มีบัญชี?"
      footerLinkText="สมัครสมาชิก"
      footerLinkHref="/register"
    >
      {/* Google Sign In */}
      <form action={signInWithGoogleAction}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-ink-600 bg-ink-800 px-4 py-2.5 text-sm font-medium text-paper-200 transition-colors hover:border-ink-500 hover:bg-ink-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          เข้าสู่ระบบด้วย Google
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ink-600" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-ink-800 px-3 text-paper-500">หรือใช้อีเมล</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form action={formAction} className="space-y-4">
        {(state.error || externalError) && (
          <p className="rounded border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-400">
            {state.error || externalError}
          </p>
        )}
        <div>
          <FieldLabel htmlFor="email">อีเมล</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
            <Input id="email" name="email" type="email" required placeholder="you@example.com" className="pl-9" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">รหัสผ่าน</FieldLabel>
            <Link href="/forgot-password" className="text-xs text-violet-400 hover:underline">
              ลืมรหัสผ่าน?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
            <Input id="password" name="password" type="password" required placeholder="••••••••" className="pl-9" />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
