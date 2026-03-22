'use client';

import { motion } from 'framer-motion';
import { REGIONS, RegionInfo } from '@/lib/allRegions';

interface Props {
  selectedKey: string;
  onChange: (key: string) => void;
}

export default function RegionSelector({ selectedKey, onChange }: Props) {
  const district = REGIONS.filter((r) => r.type === 'district');
  const dongs = REGIONS.filter((r) => r.type === 'dong');

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold tracking-widest uppercase text-white/40">지역 선택</p>

      {/* 구 전체 버튼 */}
      <div className="flex gap-2">
        {district.map((r) => (
          <RegionBtn key={r.key} region={r} selected={selectedKey === r.key} onClick={() => onChange(r.key)} variant="district" />
        ))}
      </div>

      {/* 동 버튼 그리드 */}
      <div className="flex flex-wrap gap-1.5">
        {dongs.map((r) => (
          <RegionBtn key={r.key} region={r} selected={selectedKey === r.key} onClick={() => onChange(r.key)} variant="dong" />
        ))}
      </div>
    </div>
  );
}

function RegionBtn({
  region,
  selected,
  onClick,
  variant,
}: {
  region: RegionInfo;
  selected: boolean;
  onClick: () => void;
  variant: 'district' | 'dong';
}) {
  const isDistrict = variant === 'district';

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`relative px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
        selected
          ? isDistrict
            ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30'
            : 'bg-indigo-500/80 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 hover:border-white/20'
      } ${isDistrict ? 'text-base px-5 py-2' : 'text-xs'}`}
    >
      {selected && (
        <motion.span
          layoutId="region-pill"
          className="absolute inset-0 rounded-xl"
          style={{
            background: isDistrict
              ? 'linear-gradient(135deg,#3b82f6,#6366f1)'
              : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            zIndex: -1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      {region.label}
    </motion.button>
  );
}
