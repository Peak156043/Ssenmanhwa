'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export function ManhwaSearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentQuery = searchParams.get('q') || '';
  const currentStatus = searchParams.get('status') || 'all';

  const [query, setQuery] = useState(currentQuery);

  const updateFilters = (newQuery: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    updateFilters(query, currentStatus);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    updateFilters(query, newStatus);
  };

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-paper-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ค้นหาชื่อเรื่อง..."
          className="block w-full rounded-md border border-ink-600 bg-ink-900/50 py-2 pl-9 pr-3 text-sm text-paper-100 placeholder:text-paper-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <select
          value={currentStatus}
          onChange={handleStatusChange}
          className="block rounded-md border border-ink-600 bg-ink-900/50 py-2 pl-3 pr-8 text-sm text-paper-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="ongoing">กำลังเผยแพร่</option>
          <option value="completed">จบแล้ว</option>
          <option value="dropped">ยกเลิก</option>
        </select>
        
        <button
          onClick={handleSearch}
          className="rounded-md bg-ink-700 px-4 py-2 text-sm font-medium text-paper-200 hover:bg-ink-600 hover:text-white transition-colors"
        >
          ค้นหา
        </button>
      </div>
    </div>
  );
}
