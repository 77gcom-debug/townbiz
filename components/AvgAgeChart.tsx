'use client';

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { POPULATION_DATA } from '@/lib/data';

interface Props {
  activeYear: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const avgAge = payload.find((p: any) => p.dataKey === 'avgAge')?.value;
  const diff = payload.find((p: any) => p.dataKey === 'diff')?.value;
  return (
    <div className="bg-gray-900 border border-white/20 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="font-bold text-white text-base mb-2">{label}년</p>
      {avgAge != null && <p className="text-orange-300">평균연령: <span className="text-white font-semibold">{avgAge.toFixed(2)}세</span></p>}
      {diff != null && (
        <p className={diff >= 0 ? 'text-rose-400' : 'text-emerald-400'}>
          전년대비: <span className="font-semibold">{diff >= 0 ? '+' : ''}{diff.toFixed(2)}세</span>
        </p>
      )}
    </div>
  );
};

export default function AvgAgeChart({ activeYear }: Props) {
  const visibleData = POPULATION_DATA.filter((d) => d.year <= activeYear).map((d, i, arr) => ({
    year: d.year,
    avgAge: d.avgAge,
    diff: i === 0 ? null : parseFloat((d.avgAge - arr[i - 1].avgAge).toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={visibleData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="year"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="age"
          domain={[33, 49]}
          tickFormatter={(v) => `${v}세`}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <YAxis
          yAxisId="diff"
          orientation="right"
          domain={[0, 1.5]}
          tickFormatter={(v) => `+${v}세`}
          tick={{ fill: 'rgba(255,160,80,0.6)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          yAxisId="diff"
          dataKey="diff"
          fill="rgba(255,150,50,0.35)"
          radius={[3, 3, 0, 0]}
          isAnimationActive
          animationDuration={600}
        />
        <Line
          yAxisId="age"
          type="monotone"
          dataKey="avgAge"
          stroke="#FF9F43"
          strokeWidth={3}
          dot={{ fill: '#FF9F43', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 7, fill: '#fff', stroke: '#FF9F43', strokeWidth: 2 }}
          isAnimationActive
          animationDuration={600}
          animationEasing="ease-out"
        />
        <ReferenceLine yAxisId="age" y={40} stroke="rgba(255,100,100,0.3)" strokeDasharray="4 4"
          label={{ value: '40세', fill: '#FF6B6B', fontSize: 10, position: 'insideTopRight' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
