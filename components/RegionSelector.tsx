'use client';

import { motion } from 'framer-motion';
import { REGIONS, RegionInfo } from '@/lib/allRegions';

interface Props {
  selectedKey: string;
  onChange: (key: string) => void;
  multiKeys: string[];
  onMultiChange: (keys: string[]) => void;
  hint?: string;
  mode?: 'merge' | 'compare';
  maxSelect?: number;
}

export default function RegionSelector({ selectedKey, onChange, multiKeys, onMultiChange, hint, mode = 'merge', maxSelect }: Props) {
  const district = REGIONS.filter((r) => r.type === 'district');
  const dongs = REGIONS.filter((r) => r.type === 'dong');
  const isMultiMode = multiKeys.length > 0;
  const isCompare = mode === 'compare';

  const toggleMulti = (key: string) => {
    if (multiKeys.includes(key)) {
      onMultiChange(multiKeys.filter((k) => k !== key));
    } else {
      if (maxSelect && multiKeys.length >= maxSelect) return;
      onMultiChange([...multiKeys, key]);
    }
  };

  const handleDistrictClick = () => {
    onMultiChange([]);
    onChange('district');
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <p className="text-xs font-semibold tracking-widest uppercase text-white/40">지역 선택</p>
          {isMultiMode && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isCompare
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {multiKeys.length}{maxSelect ? `/${maxSelect}` : ''}개 {isCompare ? '비교' : '합산'}
            </span>
          )}
          {!isMultiMode && isCompare && (
            <span className="text-[10px] text-indigo-400/60">최대 {maxSelect ?? 4}개 선택</span>
          )}
        </div>
        {isMultiMode
          ? <button onClick={() => onMultiChange([])} className="text-[10px] text-white/40 hover:text-white/70 transition-colors shrink-0">선택 해제</button>
          : hint && <p className="text-xs text-white/35 leading-snug text-right">{hint}</p>
        }
      </div>

      <div className="flex flex-wrap gap-1.5 items-start">
        {district.map((r) => (
          <RegionBtn key={r.key} region={r} selected={!isMultiMode && selectedKey === r.key} onClick={handleDistrictClick} variant="district" />
        ))}
        {dongs.map((r) => {
          const isChecked = multiKeys.includes(r.key);
          const isDisabled = !isChecked && !!maxSelect && multiKeys.length >= maxSelect;
          return (
            <div key={r.key} className="flex flex-col items-center gap-0.5">
              <button
                onClick={() => toggleMulti(r.key)}
                disabled={isDisabled}
                className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all duration-150 ${
                  isChecked
                    ? isCompare ? 'bg-indigo-500 border-indigo-400' : 'bg-emerald-500 border-emerald-400'
                    : isDisabled ? 'bg-white/5 border-white/10 opacity-30 cursor-not-allowed' : 'bg-white/5 border-white/20 hover:border-emerald-400/60'
                }`}
              >
                {isChecked && (
                  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1.5,5 4,7.5 8.5,2" />
                  </svg>
                )}
              </button>
              <RegionBtn
                region={r}
                selected={(!isMultiMode && selectedKey === r.key) || isChecked}
                onClick={() => isDisabled ? undefined : isMultiMode ? toggleMulti(r.key) : (onMultiChange([]), onChange(r.key))}
                variant="dong"
                highlight={isChecked ? (isCompare ? 'compare' : 'multi') : undefined}
                disabled={isDisabled}
              />
            </div>
          );
        })}
      </div>

      {isMultiMode && (
        <p className={`text-xs ${isCompare ? 'text-indigo-400/80' : 'text-emerald-400/80'}`}>
          {isCompare ? '비교' : '합산'}: {multiKeys.map((k) => REGIONS.find((r) => r.key === k)?.label).join(' + ')}
        </p>
      )}
    </div>
  );
}

function RegionBtn({
  region, selected, onClick, variant, highlight, disabled,
}: {
  region: RegionInfo;
  selected: boolean;
  onClick: () => void;
  variant: 'district' | 'dong';
  highlight?: 'multi' | 'compare';
  disabled?: boolean;
}) {
  const isDistrict = variant === 'district';
  const isMultiSelected = highlight === 'multi';
  const isCompareSelected = highlight === 'compare';

  return (
    <motion.button
      onClick={onClick}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`relative px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
        disabled
          ? 'bg-white/3 border-white/5 text-white/20 cursor-not-allowed'
          : selected
          ? isCompareSelected
            ? 'bg-indigo-500/70 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
            : isMultiSelected
            ? 'bg-emerald-500/70 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
            : isDistrict
            ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30'
            : 'bg-indigo-500/80 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 hover:border-white/20'
      } ${isDistrict ? 'text-base px-5 py-2' : 'text-xs'}`}
    >
      {selected && !isMultiSelected && (
        <motion.span
          layoutId="region-pill"
          className="absolute inset-0 rounded-xl"
          style={{
            background: isDistrict ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            zIndex: -1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      {region.label}
    </motion.button>
  );
}
