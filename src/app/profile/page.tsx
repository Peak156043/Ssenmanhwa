import { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordForm } from '@/components/profile/PasswordForm';

export const metadata: Metadata = {
  title: 'โปรไฟล์ของฉัน | SSEN Manhwa',
  description: 'จัดการข้อมูลโปรไฟล์ของคุณ',
};

export default async function ProfilePage() {
  const { profile } = await requireUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-paper-100">ตั้งค่าโปรไฟล์</h1>
        <p className="mt-2 text-paper-400">จัดการข้อมูลส่วนตัวและตั้งค่าบัญชีของคุณ</p>
      </div>

      <div className="space-y-8">
        <ProfileForm 
          initialData={{
            username: profile.username,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
          }} 
        />
        
        <PasswordForm />
      </div>
    </div>
  );
}
