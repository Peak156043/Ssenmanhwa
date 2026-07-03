'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Search, Menu, X, BookMarked, LayoutDashboard, User, LogOut, ShieldCheck, Sun, Moon } from 'lucide-react';
import { signOutAction } from '@/lib/actions/auth';

interface HeaderProps {
  isLoggedIn: boolean;
  username?: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
}

export function Header({ isLoggedIn, username, avatarUrl, isAdmin }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
      setTheme('light');
      document.documentElement.classList.add('light');
    } else {
      setTheme('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="SSEN Manhwa"
            width={140}
            height={50}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <form
          action="/search"
          className="relative hidden flex-1 max-w-md md:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
          <input
            name="q"
            type="search"
            placeholder="ค้นหาเรื่อง, ผู้เขียน..."
            className="w-full rounded-full border border-ink-600 bg-ink-800 py-2 pl-9 pr-4 text-sm text-paper-100 placeholder:text-paper-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded text-paper-300 hover:bg-ink-700 hover:text-paper-100 mr-2"
            aria-label="สลับโหมด"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <Link
            href="/bookmarks"
            className="flex items-center gap-1.5 rounded px-3 py-2 text-sm text-paper-300 hover:bg-ink-700 hover:text-paper-100"
          >
            <BookMarked className="h-4 w-4" />
            เรื่องโปรด
          </Link>
          {isLoggedIn ? (
            <div className="relative ml-2">
              <button
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-ink-600 bg-ink-800 hover:border-violet-500 focus:outline-none"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={username ?? 'User'} width={36} height={36} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-paper-200">
                    {username ? username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </span>
                )}
              </button>
              
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-ink-700 bg-ink-900 shadow-xl">
                  <div className="border-b border-ink-700 px-4 py-3">
                    <p className="truncate text-sm font-medium text-paper-100">{username}</p>
                    {isAdmin && <p className="mt-0.5 text-xs text-amber-400">Admin</p>}
                  </div>
                  <div className="p-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-paper-300 hover:bg-ink-800 hover:text-paper-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      แดชบอร์ด
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-paper-300 hover:bg-ink-800 hover:text-paper-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      โปรไฟล์
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-amber-400 hover:bg-ink-800 hover:text-amber-300"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <form action={signOutAction} className="mt-1 border-t border-ink-700 pt-1">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-danger-400 hover:bg-ink-800 hover:text-danger-300"
                      >
                        <LogOut className="h-4 w-4" />
                        ออกจากระบบ
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 flex items-center gap-1.5 rounded bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
            >
              <User className="h-4 w-4" />
              เข้าสู่ระบบ
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded p-2 text-paper-300 hover:bg-ink-700"
            aria-label="สลับโหมด"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            className="rounded p-2 text-paper-300 hover:bg-ink-700"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="เปิดเมนู"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-700 px-4 py-3 md:hidden">
          <form action="/search" className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
            <input
              name="q"
              type="search"
              placeholder="ค้นหาเรื่อง, ผู้เขียน..."
              className="w-full rounded-full border border-ink-600 bg-ink-800 py-2 pl-9 pr-4 text-sm text-paper-100 placeholder:text-paper-500 focus:border-violet-500 focus:outline-none"
            />
          </form>
          <div className="flex flex-col gap-1">
            <Link
              href="/bookmarks"
              className="flex items-center gap-2 rounded px-3 py-2 text-sm text-paper-300 hover:bg-ink-700"
              onClick={() => setMenuOpen(false)}
            >
              <BookMarked className="h-4 w-4" />
              เรื่องโปรด
            </Link>
            {isLoggedIn ? (
              <>
                <div className="mb-2 flex items-center gap-3 border-b border-ink-700 pb-3 pt-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink-600 bg-ink-800">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={username ?? 'User'} width={40} height={40} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-paper-200">
                        {username ? username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-paper-100">{username}</p>
                    {isAdmin && <p className="text-xs text-amber-400">Admin</p>}
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-paper-300 hover:bg-ink-700"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  แดชบอร์ด
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-paper-300 hover:bg-ink-700"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  โปรไฟล์
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded px-3 py-2 text-sm text-amber-400 hover:bg-ink-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <form action={signOutAction} className="mt-2 border-t border-ink-700 pt-2">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-danger-400 hover:bg-ink-700"
                  >
                    <LogOut className="h-4 w-4" />
                    ออกจากระบบ
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="mt-1 flex items-center gap-2 rounded bg-violet-500 px-3 py-2 text-sm font-medium text-white"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
