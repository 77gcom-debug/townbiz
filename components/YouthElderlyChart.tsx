'use client';

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { YearData } from '@/lib/data';
import { getYouthPop, getElderlyPop } from '@/lib/allRegions';

interface Props {
  data: YearData[];
  activeYear: number;
  regionLabel: string;
  type: 'youth' | 'elderly';
}

const YOUTH_COLOR = '#48DBFB';
const ELDERLY_COLOR = '#FF9F43';

const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const total = payload[0]?.payload?.total;
  const ratio = total ? ((val / total) * 100).toFixed(1) : '–';
  const isYouth = type === 'youth';

  return (
    <div className="bg-gray-900 border border-white/20 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="font-bold text-white text-base mb-2">{label}년</p>
      <p style={{ color: isYouth ? YOUTH_COLOR : ELDERLY_COLOR }}>
        {isYouth ? '유소년(0~19세)' : '고령(60세 이상)'}:{' '}
        <span className="text-white font-semibold">{val?.toLocaleString()}명</span>
      </p>
      <p className="text-white/50 text-xs">전체 인구 대비 <span className="text-white/80 font-medium">{ratio}%</span></p>
    </div>
  );
};

export default function YouthElderlyChart({ data, activeYear, regionLabel, type }: Props) {
  const isYouth = type === 'youth';
  const color = isYouth ? YOUTH_COLOR : ELDERLY_COLOR;
  const gradId = isYouth ? 'youthGrad' : 'elderlyGrad';

  const chartData = data
    .filter((d) => d.year <= activeYear && d.total > 0)
    .map((d) => ({
      year: d.year,
      total: d.total,
      value: isYouth ? getYouthPop(d) : getElderlyPop(d),
      ratio: d.total > 0
        ? parseFloat(((isYouth ? getYouthPop(d) : getElderlyPop(d)) / d.total * 100).toFixed(1))
        : 0,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-white/30 text-sm">
        해당 연도에 데이터가 없습니다
      </div>
    );
  }

  const baseVal = chartData[0]?.value ?? 0;
  const currVal = chartData[chartData.length - 1]?.value ?? 0;
  const diff = currVal - baseVal;
  const diffRate = baseVal > 0 ? ((currVal / baseVal - 1) * 100).toFixed(1) : '–';

  return (
    <div className="flex flex-col gap-3">
      {/* 요약 배지 */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: `${color}22`, color }}
        >
          {isYouth ? '유소년 (0~19세)' : '고령 (60세 이상)'}
        </span>
        <span className="text-white/60 text-xs">{regionLabel}</span>
        <span className={`text-xs font-semibold ml-auto ${diff < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
          {chartData[0]?.year}년 기준 {diff >= 0 ? '+' : ''}{diff.toLocaleString()}명 ({diff >= 0 ? '+' : ''}{diffRate}%)
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="year"
            tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="val"
            tickFormatter={(v) => v >= 10000 ? `${(v / 10000).toFixed(0)}만` : v.toLocaleString()}
            tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <YAxis
            yAxisId="ratio"
            orientation="right"
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: `${color}99`, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip type={type} />} />

          {/* 넘는 기준선: 유소년 20%, 고령 20% */}
          <ReferenceLine
            yAxisId="ratio"
            y={20}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="4 4"
            label={{ value: '20%', fill: 'rgba(255,255,255,0.3)', fontSize: 9, position: 'insideTopRight' }}
          />

          <Area
            yAxisId="val"
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradId})`}
            dot={{ fill: color, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#fff', stroke: color, strokeWidth: 2 }}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          />
          <Line
            yAxisId="ratio"
            type="monotone"
            dataKey="ratio"
            stroke={`${color}88`}
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            isAnimationActive
            animationDuration={700}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 하단 인사이트 텍스트 */}
      <p className="text-xs text-white/40 leading-relaxed">
        {isYouth
          ? `마을의 미래 동력인 아이들과 청소년의 숫자입니다. ${chartData[0]?.year}년 약 ${(baseVal).toLocaleString()}명에서 ${activeYear}년 ${currVal.toLocaleString()}명으로 ${Math.abs(diff).toLocaleString()}명 감소했습니다.`
          : `의료 기술 발달과 저출산 여파로 매년 꾸준히 증가하는 추세를 보입니다. ${chartData[0]?.year}년 ${baseVal.toLocaleString()}명에서 ${activeYear}년 ${currVal.toLocaleString()}명으로 ${Math.abs(diff).toLocaleString()}명 증가했습니다.`
        }
      </p>
    </div>
  );
}
