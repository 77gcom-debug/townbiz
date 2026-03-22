'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { POPULATION_DATA } from '@/lib/data';

interface Props {
  activeYear: number;
  isPlaying: boolean;
  onYearChange: (year: number) => void;
  onTogglePlay: () => void;
}

const YEARS = POPULATION_DATA.map((d) => d.year);

export default function TimelineSlider({ activeYear, isPlaying, onYearChange, onTogglePlay }: Props) {
  const idx = YEARS.indexOf(activeYear);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex flex-col gap-3">
      {/* 상단: 재생 버튼 + 연도 표시 */}
      <div className="flex items-center gap-4">
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center text-white transition shrink-0 shadow-lg shadow-blue-500/30"
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        <div className="flex-1 relative">
          {/* 트랙 */}
          <div className="w-full h-1 bg-white/10 rounded-full relative">
            <motion.div
              className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
              animate={{ width: `${(idx / (YEARS.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {/* 눈금 점 */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-0">
            {YEARS.map((year, i) => (
              <button
                key={year}
                onClick={() => onYearChange(year)}
                className="w-3 h-3 rounded-full transition-all -mt-px"
                style={{
                  background: year <= activeYear ? '#54A0FF' : 'rgba(255,255,255,0.15)',
                  transform: year === activeYear ? 'scale(1.6)' : 'scale(1)',
                }}
                title={String(year)}
              />
            ))}
          </div>
        </div>

        <span className="text-2xl font-black text-white w-16 text-right tabular-nums">
          {activeYear}
        </span>
      </div>

      {/* 연도 레이블 */}
      <div className="flex justify-between px-0 pl-14 pr-16">
        {YEARS.filter((y) => y % 5 === 0 || y === YEARS[YEARS.length - 1]).map((year) => (
          <span key={year} className="text-[10px] text-white/30">{year}</span>
        ))}
      </div>
    </div>
  );
}
