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
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col gap-2"
    >
      <span className="text-xs font-medium tracking-widest uppercase text-white/50">{label}</span>
      <div className="flex items-end gap-1">
        <AnimatedNumber
          value={value}
          decimals={decimals}
          suffix={unit}
          className="text-3xl font-bold"
          duration={1.4}
        />
      </div>
      {diff !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          <span>{isPositive ? '▲' : '▼'}</span>
          <AnimatedNumber
            value={Math.abs(diff)}
            decimals={decimals}
            suffix={unit}
            duration={1.4}
          />
          <span className="text-white/40 font-normal ml-1">{diffLabel}</span>
        </div>
      )}
    </motion.div>
  );
}
