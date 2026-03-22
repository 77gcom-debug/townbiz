'use client';

import { motion } from 'framer-motion';
import { AGE_GROUPS, AGE_COLORS, YearData } from '@/lib/data';

interface Props {
  data: YearData;
}

export default function AgeBarRace({ data }: Props) {
  const maxVal = Math.max(...AGE_GROUPS.map((a) => data.ages[a]));

  const sorted = [...AGE_GROUPS]
    .map((age) => ({ age, val: data.ages[age] }))
    .sort((a, b) => b.val - a.val);

  return (
    <div className="flex flex-col gap-[5px]">
      {sorted.map(({ age, val }, i) => {
        const pct = (val / maxVal) * 100;
        return (
          <div key={age} className="flex items-center gap-2 group">
            <span className="text-[11px] text-white/60 w-16 text-right shrink-0">{age}</span>
            <div className="relative flex-1 h-6 bg-white/5 rounded-md overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-md"
                style={{ background: AGE_COLORS[age] }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.04 }}
              />
              <motion.span
                className="absolute inset-y-0 left-2 flex items-center text-[11px] font-semibold text-white/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
              >
                {val.toLocaleString()}명
              </motion.span>
            </div>
            <span className="text-[10px] text-white/40 w-10 shrink-0">
              {((val / data.total) * 100).toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
