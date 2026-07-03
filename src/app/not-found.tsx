import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-5xl text-violet-500">404</p>
      <h1 className="mt-3 text-lg font-medium text-paper-100">ไม่พบหน้านี้</h1>
      <p className="mt-1 text-sm text-paper-500">
        เรื่องหรือตอนที่คุณกำลังหาอาจถูกลบ หรือยังไม่เผยแพร่
      </p>
      <Link href="/" className="mt-6">
        <Button>กลับหน้าแรก</Button>
      </Link>
    </div>
  );
}
