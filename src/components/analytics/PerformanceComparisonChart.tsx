import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface PerformancePoint {
  label: string;
  completed: number;
  skipped: number;
  pending: number;
}

interface PerformanceComparisonChartProps {
  data: PerformancePoint[];
}

export const PerformanceComparisonChart: React.FC<PerformanceComparisonChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            allowDecimals={false}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0b1120',
              borderColor: 'rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(val: string) => <span className="text-slate-300 text-xs capitalize">{val}</span>}
          />
          <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="skipped" name="Skipped" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="pending" name="Pending" fill="#64748B" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
