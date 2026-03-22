'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { POPULATION_DATA, YearData } from '@/lib/data';

interface Props {
  activeYear: number;
  data?: YearData[];
}

const CustomTooltip = ({ active, payload, label, base }: any) => {
  if (!active || !payload?.length) return null;
  const d: YearData = payload[0].payload;
  const diff = d.total - base;
  const rate = base > 0 ? ((d.total / base) - 1) * 100 : 0;
  return (
    <div className="bg-gray-900 border border-white/20 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="font-bold text-white text-base mb-2">{label}년</p>
      <p className="text-blue-300">총인구: <span className="text-white font-semibold">{d.total.toLocaleString()}명</span></p>
      <p className={diff < 0 ? 'text-rose-400' : 'text-emerald-400'}>
        기준 대비: <span className="font-semibold">{diff >= 0 ? '+' : ''}{diff.toLocaleString()}명 ({rate.toFixed(2)}%)</span>
      </p>
    </div>
  );
};

export default function TotalPopChart({ activeYear, data }: Props) {
  const sourceData = (data ?? POPULATION_DATA).filter(d => d.total > 0);
  const visibleData = sourceData.filter((d) => d.year <= activeYear);
  const baseTotal = sourceData[0]?.total ?? 0;
  const maxTotal = Math.max(...sourceData.map(d => d.total));
  const minTotal = Math.min(...sourceData.map(d => d.total));

  const domainMin = Math.floor(minTotal * 0.95 / 10000) * 10000;
  const domainMax = Math.ceil(maxTotal * 1.05 / 10000) * 10000;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={visibleData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#54A0FF" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#54A0FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="year"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[domainMin, domainMax]}
          tickFormatter={(v) => v >= 10000 ? `${(v / 10000).toFixed(0)}만` : v.toLocaleString()}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<CustomTooltip base={baseTotal} />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#54A0FF"
          strokeWidth={2.5}
          fill="url(#popGrad)"
          dot={{ fill: '#54A0FF', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#fff', stroke: '#54A0FF', strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
