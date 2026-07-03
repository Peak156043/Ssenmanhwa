'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface StatChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  name?: string;
}

export function StatChart({ data, xKey, yKey, color = '#8b5cf6', name = 'Value' }: StatChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-ink-700 bg-ink-900/50">
        <p className="text-sm text-paper-500">ไม่มีข้อมูลในช่วงเวลานี้</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-700)" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            stroke="var(--paper-400)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="var(--paper-400)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value)}
          />
          <Tooltip 
            cursor={{ fill: 'var(--ink-800)', opacity: 0.4 }}
            contentStyle={{ backgroundColor: 'var(--ink-900)', borderColor: 'var(--ink-700)', borderRadius: '0.5rem', color: 'var(--paper-100)' }}
            itemStyle={{ color: 'var(--paper-200)' }}
          />
          <Bar 
            dataKey={yKey} 
            name={name}
            fill={color} 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
