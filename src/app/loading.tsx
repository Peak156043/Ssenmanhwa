import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex w-full items-center justify-center py-20 min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );
}
