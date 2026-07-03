'use client';

import { useState, useEffect } from 'react';
import { getDashboardStatsAction, DashboardPeriod } from '@/lib/actions/dashboard';
import { StatChart } from './StatChart';
import { parseISO, format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export function DashboardCharts() {
  const [period, setPeriod] = useState<DashboardPeriod>('daily');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    views: [],
    users: [],
    comments: [],
    bookmarks: [],
    manhwas: []
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const stats = await getDashboardStatsAction(period);
        setData(stats);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      }
      setLoading(false);
    }
    loadData();
  }, [period]);

  const groupData = (rawData: any[], dateField: string, valueField: string) => {
    const grouped: Record<string, number> = {};
    
    rawData.forEach(item => {
      if (!item[dateField]) return;
      const d = parseISO(item[dateField]);
      let key = '';
      
      if (period === 'daily') {
        key = format(d, 'yyyy-MM-dd');
      } else if (period === 'weekly') {
        key = format(startOfWeek(d), 'yyyy-MM-dd');
      } else if (period === 'monthly') {
        key = format(startOfMonth(d), 'yyyy-MM-dd');
      } else if (period === 'yearly') {
        key = format(startOfYear(d), 'yyyy-MM-dd');
      }
      
      const value = item[valueField] !== undefined ? item[valueField] : 1;
      grouped[key] = (grouped[key] || 0) + value;
    });
    
    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map(k => {
        const d = parseISO(k);
        let label = '';
        if (period === 'daily') label = format(d, 'dd MMM');
        else if (period === 'weekly') label = `Wk ${format(d, 'dd MMM')}`;
        else if (period === 'monthly') label = format(d, 'MMM yy');
        else if (period === 'yearly') label = format(d, 'yyyy');
        
        return {
          name: label,
          value: grouped[k]
        };
      });
  };

  const viewsData = groupData(data.views, 'view_date', 'view_count');
  const usersData = groupData(data.users, 'created_at', 'dummy');
  
  // Combine comments and bookmarks for engagement
  const engagementRaw = [
    ...data.comments.map((c: any) => ({ ...c, type: 'comment' })),
    ...data.bookmarks.map((b: any) => ({ ...b, type: 'bookmark' }))
  ];
  const engagementData = groupData(engagementRaw, 'created_at', 'dummy');
  
  const contentData = groupData(data.manhwas, 'created_at', 'dummy');

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-paper-100">กราฟสถิติการใช้งาน</h2>
        <div className="flex rounded-md border border-ink-700 bg-ink-900 p-1">
          {(['daily', 'weekly', 'monthly', 'yearly'] as DashboardPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-violet-500 text-white'
                  : 'text-paper-400 hover:text-paper-200'
              }`}
            >
              {p === 'daily' ? 'รายวัน' : p === 'weekly' ? 'รายสัปดาห์' : p === 'monthly' ? 'รายเดือน' : 'รายปี'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid h-[300px] place-items-center rounded-lg border border-ink-700 bg-ink-900/50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Views Chart */}
          <div className="rounded-lg border border-ink-700 bg-ink-800/60 p-4">
            <h3 className="mb-4 text-sm font-medium text-paper-200">ยอดเข้าชมรวม (Views)</h3>
            <StatChart data={viewsData} xKey="name" yKey="value" color="#8b5cf6" name="ยอดวิว" />
          </div>

          {/* Users Chart */}
          <div className="rounded-lg border border-ink-700 bg-ink-800/60 p-4">
            <h3 className="mb-4 text-sm font-medium text-paper-200">ผู้ใช้ใหม่ (New Users)</h3>
            <StatChart data={usersData} xKey="name" yKey="value" color="#10b981" name="ผู้ใช้ใหม่" />
          </div>

          {/* Engagement Chart */}
          <div className="rounded-lg border border-ink-700 bg-ink-800/60 p-4">
            <h3 className="mb-4 text-sm font-medium text-paper-200">การมีส่วนร่วม (Comments & Bookmarks)</h3>
            <StatChart data={engagementData} xKey="name" yKey="value" color="#f59e0b" name="กิจกรรม" />
          </div>

          {/* Content Growth Chart */}
          <div className="rounded-lg border border-ink-700 bg-ink-800/60 p-4">
            <h3 className="mb-4 text-sm font-medium text-paper-200">มังฮวาใหม่ (Content Growth)</h3>
            <StatChart data={contentData} xKey="name" yKey="value" color="#3b82f6" name="จำนวนมังฮวา" />
          </div>
        </div>
      )}
    </div>
  );
}
