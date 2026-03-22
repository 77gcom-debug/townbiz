'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { POPULATION_DATA, AGE_GROUPS, AGE_COLORS, AgeGroup } from '@/lib/data';

interface Props {
  activeYear: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-white/20 rounded-xl px-4 py-3 shadow-2xl text-xs max-w-[200px]">
      <p className="font-bold text-white text-sm mb-2">{label}년</p>
      {[...payload].reverse().map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-0.5">
          <span style={{ color: p.fill }}>{p.dataKey}</span>
          <span className="text-white font-medium">{p.value.toLocaleString()}명</span>
        </div>
      ))}
    </div>
  );
};

const CustomLegend = () => (
  <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
    {AGE_GROUPS.map((age) => (
      <div key={age} className="flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: AGE_COLORS[age] }} />
        <span className="text-[10px] text-white/60">{age}</span>
      </div>
    ))}
  </div>
);

export default function AgeGroupChart({ activeYear }: Props) {
  const visibleData = POPULATION_DATA.filter((d) => d.year <= activeYear).map((d) => ({
    year: d.year,
    ...d.ages,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={visibleData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          {AGE_GROUPS.map((age) => (
            <Bar
              key={age}
              dataKey={age}
              stackId="a"
              fill={AGE_COLORS[age]}
              isAnimationActive
              animationDuration={600}
              animationEasing="ease-out"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <CustomLegend />
    </div>
  );
}
