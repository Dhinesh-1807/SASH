import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface CategoryPoint {
  name: string;
  minutes: number;
  color: string;
  percentage?: number;
}

interface CategoryBreakdownChartProps {
  data: CategoryPoint[];
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ data }) => {
  const filteredData = data.filter((d) => d.minutes > 0);

  if (filteredData.length === 0) {
    return (
      <div className="w-full h-64 sm:h-72 flex flex-col items-center justify-center text-slate-500 text-xs">
        <p>No focus time recorded for selected period.</p>
        <p className="text-[11px] text-slate-600 mt-1">Complete routines to view category breakdown.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="minutes"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#070b16" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0b1120',
              borderColor: 'rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value: any, name: any) => [`${value} mins`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(val: string) => <span className="text-slate-300 text-xs">{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
