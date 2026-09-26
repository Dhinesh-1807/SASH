import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface CompletionRatePoint {
  date: string;
  rate: number;
  label: string;
}

interface CompletionRateChartProps {
  data: CompletionRatePoint[];
}

export const CompletionRateChart: React.FC<CompletionRateChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#00C2FF" />
            </linearGradient>
          </defs>
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
            domain={[0, 100]}
            unit="%"
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
            formatter={(value: any) => [`${value}%`, 'Completion Rate']}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="url(#lineGlow)"
            strokeWidth={3}
            dot={{ r: 4, fill: '#00C2FF', stroke: '#070b16', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#38D3FF', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
