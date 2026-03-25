'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { ALL_REGION_DATA, REGIONS, getYouthPop, getElderlyPop } from '@/lib/allRegions';
import { POPULATION_DATA } from '@/lib/data';
import AnimatedNumber from './AnimatedNumber';

const YEARS = POPULATION_DATA.map(d => d.year);

const DONG_COLORS = [
  '#6366f1', '#FF9F43', '#1DD1A1', '#FF6B6B',
];
const DONG_COLORS_DARK = [
  '#6366f133', '#FF9F4333', '#1DD1A133', '#FF6B6B33',
];

const METRICS = [
  {
    key: 'total',
    label: '총 인구',
    unit: '명',
    fmt: (v: number) => v >= 10000 ? `${(v / 10000).toFixed(1)}만` : v.toLocaleString(),
    suffix: '명',
  },
  {
    key: 'youth',
    label: '유소년 인구',
    unit: '명',
    fmt: (v: number) => v.toLocaleString(),
    suffix: '명',
  },
  {
    key: 'elderly',
    label: '고령 인구',
    unit: '명',
    fmt: (v: number) => v.toLocaleString(),
    suffix: '명',
  },
  {
    key: 'avgAge',
    label: '평균연령',
    unit: '세',
    fmt: (v: number) => `${v.toFixed(1)}`,
    suffix: '세',
  },
];

function EndDot({ cx, cy, index, data, dataKey, color, fmt }: any) {
  if (index !== data.length - 1) return null;
  const value = data[index]?.[dataKey];
  if (value == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#0B0F1A" strokeWidth={2} />
      <text x={cx + 9} y={cy + 4} fill={color} fontSize={11} fontWeight="bold" style={{ textShadow: '0 0 6px #0B0F1A' }}>
        {fmt(value)}
      </text>
    </g>
  );
}

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-white/20 rounded-xl px-4 py-3 shadow-2xl text-xs min-w-[160px]">
      <p className="font-bold text-white mb-2">{label}년</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className="font-semibold text-white tabular-nums">
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{unit}
          </span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  selectedDongs: string[];
  activeYear?: number;
}

export default function DongCompareChart({ selectedDongs, activeYear }: Props) {
  const dongLabels = selectedDongs.map(k => REGIONS.find(r => r.key === k)?.label ?? k);

  // activeYear까지만 데이터 구성 (인구현황처럼 차트가 성장하는 효과)
  const visibleYears = activeYear ? YEARS.filter(y => y <= activeYear) : YEARS;

  const buildRow = (year: number) => {
    const row: Record<string, any> = { year };
    selectedDongs.forEach(key => {
      const label = REGIONS.find(r => r.key === key)?.label ?? key;
      const d = (ALL_REGION_DATA[key] ?? POPULATION_DATA).find(x => x.year === year);
      if (d && d.total > 0) {
        row[`${label}_total`]   = d.total;
        row[`${label}_youth`]   = getYouthPop(d);
        row[`${label}_elderly`] = getElderlyPop(d);
        row[`${label}_avgAge`]  = d.avgAge;
      }
    });
    return row;
  };

  const chartData = visibleYears.map(buildRow);

  // activeYear 기준 현재값 / 기준값
  const currentRow = chartData[chartData.length - 1] ?? null;
  const baseRow = buildRow(YEARS[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* 선택 없을 때 */}
      {selectedDongs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 gap-4"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="text-5xl"
          >
            ☝️
          </motion.div>
          <div className="text-center space-y-1.5">
            <p className="text-base font-bold text-white/70">상단 지역 선택에서 동을 체크해 주세요</p>
            <p className="text-xs text-white/35">최대 4개 동을 선택해 연도별 수치를 비교합니다</p>
          </div>
          {/* 위쪽 화살표 */}
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1 text-blue-400/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginTop: '-10px' }}>
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </motion.div>
        </motion.div>
      )}

      {selectedDongs.length > 0 && (
        <>
          {/* ── KPI 카드: 선택된 동별 현재 수치 (항상 1행) ── */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={selectedDongs.join(',')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${selectedDongs.length}, minmax(0, 1fr))` }}
            >
              {selectedDongs.map((key, i) => {
                const label = dongLabels[i];
                const color = DONG_COLORS[i];
                const cur = currentRow ?? {};
                const base = baseRow ?? {};
                const total = cur[`${label}_total`] ?? 0;
                const baseTotal = base[`${label}_total`] ?? 0;
                const diff = total - baseTotal;
                const rate = baseTotal > 0 ? ((total / baseTotal - 1) * 100) : 0;
                const isDown = diff < 0;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-xl px-4 py-3 border-2 flex flex-row items-center gap-4"
                    style={{
                      background: `linear-gradient(135deg, ${color}1a 0%, ${color}08 100%)`,
                      borderColor: `${color}55`,
                      boxShadow: `0 0 24px ${color}1a`,
                    }}
                  >
                    {/* 왼쪽: 동 이름 */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                        <span className="text-sm font-black" style={{ color }}>{label}</span>
                      </div>
                      <span className="text-[10px] text-white/30 pl-4">{activeYear}년</span>
                    </div>

                    {/* 구분선 */}
                    <div className="w-px self-stretch shrink-0" style={{ background: `${color}33` }} />

                    {/* 오른쪽: 수치 */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <AnimatedNumber
                        value={total}
                        suffix="명"
                        duration={0.8}
                        className="text-2xl md:text-3xl font-black text-white tabular-nums leading-none"
                      />
                      {diff !== 0 && (
                        <div className={`flex items-center gap-1.5 text-sm font-bold ${isDown ? 'text-rose-400' : 'text-emerald-400'}`}>
                          <span className="text-base">{isDown ? '▼' : '▲'}</span>
                          <AnimatedNumber value={Math.abs(diff)} suffix="명" duration={0.8} />
                          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${isDown ? 'bg-rose-500/25 text-rose-300' : 'bg-emerald-500/25 text-emerald-300'}`}>
                            {isDown ? '−' : '+'}<AnimatedNumber value={Math.abs(rate)} decimals={1} suffix="%" duration={0.8} />
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* ── AreaChart 4개 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {METRICS.map((m, mi) => (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + mi * 0.08 }}
                className="bg-black/20 rounded-2xl p-4 relative overflow-hidden"
              >
                {/* 배경 연도 워터마크 */}
                {activeYear && (
                  <div
                    className="absolute bottom-8 right-3 font-black tabular-nums pointer-events-none select-none"
                    style={{ fontSize: '72px', color: 'rgba(255,255,255,0.035)', lineHeight: 1 }}
                  >
                    {activeYear}
                  </div>
                )}

                <p className="text-xs font-semibold text-white/60 mb-3">{m.label} ({m.unit})</p>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={chartData} margin={{ top: 12, right: 60, left: 0, bottom: 0 }}>
                    <defs>
                      {selectedDongs.map((_, i) => (
                        <linearGradient key={i} id={`grad_${m.key}_${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={DONG_COLORS[i]} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={DONG_COLORS[i]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                      axisLine={false} tickLine={false} width={46}
                      tickFormatter={m.fmt}
                      domain={[(dataMin: number) => Math.floor(dataMin * 0.96), (dataMax: number) => Math.ceil(dataMax * 1.02)]}
                    />
                    <Tooltip content={<CustomTooltip unit={m.unit} />} />

                    {/* 현재 연도 기준선 */}
                    {activeYear && visibleYears.includes(activeYear) && visibleYears.length < YEARS.length && (
                      <ReferenceLine
                        x={activeYear}
                        stroke="rgba(255,255,255,0.45)"
                        strokeWidth={1.5}
                        strokeDasharray="5 3"
                        label={{
                          value: `${activeYear}년`,
                          position: 'insideTopLeft',
                          fill: 'rgba(255,255,255,0.7)',
                          fontSize: 11,
                          fontWeight: 'bold',
                        }}
                      />
                    )}

                    {/* 동별 Area — activeYear까지만 데이터가 쌓이는 구조 */}
                    {dongLabels.map((label, i) => (
                      <Area
                        key={`area_${label}_${m.key}`}
                        type="monotone"
                        dataKey={`${label}_${m.key}`}
                        name={label}
                        stroke={DONG_COLORS[i]}
                        strokeWidth={2.5}
                        fill={`url(#grad_${m.key}_${i})`}
                        dot={(props: any) => (
                          <EndDot
                            {...props}
                            data={chartData}
                            dataKey={`${label}_${m.key}`}
                            color={DONG_COLORS[i]}
                            fmt={m.fmt}
                          />
                        )}
                        activeDot={{ r: 6, fill: '#fff', stroke: DONG_COLORS[i], strokeWidth: 2 }}
                        isAnimationActive
                        animationDuration={500}
                        animationEasing="ease-out"
                        connectNulls
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>

                {/* 커스텀 범례 */}
                <div className="flex flex-wrap gap-3 mt-2">
                  {dongLabels.map((label, i) => {
                    const val = currentRow?.[`${label}_${m.key}`];
                    return (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: DONG_COLORS[i] }} />
                        <span className="text-[10px] font-semibold" style={{ color: DONG_COLORS[i] }}>{label}</span>
                        {val != null && (
                          <span className="text-[10px] text-white/50 tabular-nums">
                            {m.fmt(val)}{m.unit}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
