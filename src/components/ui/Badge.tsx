import { clsx } from 'clsx';
import { ManhwaStatus } from '@/types';

const statusLabel: Record<ManhwaStatus, string> = {
  ongoing: 'กำลังอัพเดท',
  completed: 'จบแล้ว',
  hiatus: 'หยุดพัก',
};

const statusClass: Record<ManhwaStatus, string> = {
  ongoing: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  completed: 'bg-paper-500/15 text-paper-300 border-paper-500/30',
  hiatus: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

export function StatusBadge({ status }: { status: ManhwaStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium',
        statusClass[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

export function GenreBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-ink-500 bg-ink-800 px-2 py-0.5 text-xs text-paper-300">
      {name}
    </span>
  );
}
