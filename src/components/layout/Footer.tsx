import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-700 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-paper-500 sm:gap-6">
          <span className="font-display text-paper-300">© 2026 ManhwaReader</span>
          <span className="hidden text-ink-600 sm:inline">|</span>
          <Link href="/" className="hover:text-paper-200">
            หน้าแรก
          </Link>
          <span className="hidden text-ink-600 sm:inline">|</span>
          <Link href="/bookmarks" className="hover:text-paper-200">
            เรื่องโปรด
          </Link>
          <span className="hidden text-ink-600 sm:inline">|</span>
          <Link href="/login" className="hover:text-paper-200">
            เข้าสู่ระบบ
          </Link>
          <span className="hidden text-ink-600 sm:inline">|</span>
          <Link href="/register" className="hover:text-paper-200">
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </footer>
  );
}

