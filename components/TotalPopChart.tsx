'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { POPULATION_DATA, YearData } from '@/lib/data';
import AnimatedNumber from './AnimatedNumber';

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
  const baseYear = sourceData[0]?.year ?? 2010;
  const currentTotal = visibleData[visibleData.length - 1]?.total ?? baseTotal;

  const diff = currentTotal - baseTotal;
  const rate = baseTotal > 0 ? ((currentTotal / baseTotal) - 1) * 100 : 0;
  const isDecrease = diff < 0;

  const maxTotal = Math.max(...sourceData.map(d => d.total));
  const minTotal = Math.min(...sourceData.map(d => d.total));
  const domainMin = Math.floor(minTotal * 0.95 / 10000) * 10000;
  const domainMax = Math.ceil(maxTotal * 1.05 / 10000) * 10000;

  return (
    <div className="flex flex-col gap-3">
      {/* ── 큰 숫자 오버레이 ── */}
      <div className="flex items-stretch justify-between gap-3">
        {/* 현재 인구 */}
        <div className="flex flex-col justify-center">
          <AnimatedNumber
            value={currentTotal}
            suffix="명"
            duration={0.7}
            className="text-2xl md:text-3xl font-black text-white tabular-nums leading-none"
          />
          <span className="text-[11px] text-white/35 mt-1">{activeYear}년 총 인구</span>
        </div>

        {/* 감소/증가 강조 블록 */}
        <AnimatePresence mode="wait">
          {activeYear > baseYear && (
            <motion.div
              key={`${activeYear}-stat`}
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.35 }}
              className={`flex flex-col items-end justify-center px-4 py-2 rounded-2xl border ${
                isDecrease
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              {/* 증감명 */}
              <div className={`flex items-center gap-1 ${isDecrease ? 'text-rose-400' : 'text-emerald-400'}`}>
                <span className="text-base font-black">{isDecrease ? '▼' : '▲'}</span>
                <AnimatedNumber
                  value={Math.abs(diff)}
                  suffix="명"
                  duration={0.7}
                  className="text-xl md:text-2xl font-black tabular-nums leading-none"
                />
              </div>
              {/* 비율 — 가장 크게 */}
              <AnimatedNumber
                value={Math.abs(rate)}
                decimals={1}
                prefix={isDecrease ? '−' : '+'}
                suffix="%"
                duration={0.7}
                className={`text-2xl md:text-4xl font-black tabular-nums leading-tight ${
                  isDecrease ? 'text-rose-400' : 'text-emerald-400'
                }`}
              />
              <span className="text-[10px] text-white/30 mt-0.5">{baseYear}년 대비</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 차트 ── */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={visibleData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isDecrease ? '#FF6B6B' : '#54A0FF'} stopOpacity={0.35} />
              <stop offset="95%" stopColor={isDecrease ? '#FF6B6B' : '#54A0FF'} stopOpacity={0} />
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
            stroke={isDecrease ? '#FF6B6B' : '#54A0FF'}
            strokeWidth={2.5}
            fill="url(#popGrad)"
            dot={{ fill: isDecrease ? '#FF6B6B' : '#54A0FF', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#fff', stroke: isDecrease ? '#FF6B6B' : '#54A0FF', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
