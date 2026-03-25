'use client';

import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

interface Props {
  label: string;
  value: number;
  diff?: number;
  diffLabel?: string;
  unit?: string;
  decimals?: number;
  color?: string;
  delay?: number;
}

export default function KpiCard({
  label,
  value,
  diff,
  diffLabel = '2010년 대비',
  unit = '',
  decimals = 0,
  color = '#54A0FF',
  delay = 0,
}: Props) {
  const isPositive = diff !== undefined && diff >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col gap-1.5"
    >
      <span className="text-xs font-medium tracking-widest uppercase text-white/50">{label}</span>
      {/* 메인 수치 — 줄바꿈 방지 */}
      <div className="flex items-end gap-1 overflow-hidden">
        <AnimatedNumber
          value={value}
          decimals={decimals}
          suffix={unit}
          className="text-3xl md:text-4xl font-black tabular-nums whitespace-nowrap"
          duration={0.75}
        />
      </div>
      {/* diff 행 — 고정 높이로 레이아웃 안정화 */}
      <div className="h-6 flex items-center gap-1.5 text-sm font-bold overflow-hidden">
        {diff !== undefined && (
          <>
            <span className={`text-base ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '▲' : '▼'}
            </span>
            <AnimatedNumber
              value={Math.abs(diff)}
              decimals={decimals}
              suffix={unit}
              duration={0.75}
              className={`tabular-nums whitespace-nowrap ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}
            />
            <span className="text-white/35 font-normal ml-0.5 whitespace-nowrap text-xs">{diffLabel}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
