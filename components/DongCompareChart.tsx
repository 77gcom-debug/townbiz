'use client';

import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { ALL_REGION_DATA, REGIONS, getYouthPop, getElderlyPop } from '@/lib/allRegions';
import { POPULATION_DATA } from '@/lib/data';

const YEARS = POPULATION_DATA.map(d => d.year);

const DONG_COLORS = [
  '#6366f1', '#FF9F43', '#1DD1A1', '#FF6B6B',
  '#48DBFB', '#FECA57', '#C8D6E5', '#ff9ff3',
];

const METRICS = [
  { key: 'total',    label: '총 인구',    unit: '명',  fmt: (v: number) => v >= 10000 ? `${(v/10000).toFixed(1)}만` : v.toLocaleString() },
  { key: 'youth',    label: '유소년 인구', unit: '명',  fmt: (v: number) => v.toLocaleString() },
  { key: 'elderly',  label: '고령 인구',  unit: '명',  fmt: (v: number) => v.toLocaleString() },
  { key: 'avgAge',   label: '평균연령',   unit: '세',  fmt: (v: number) => `${v.toFixed(1)}` },
];

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-white/20 rounded-xl px-4 py-3 shadow-2xl text-xs min-w-[160px]">
      <p className="font-bold text-white mb-2">{label}년</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className="font-semibold text-white tabular-nums">{p.value?.toLocaleString()}{unit}</span>
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
  // 차트 데이터 구성
  const chartData = YEARS.map(year => {
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
  });

  const dongLabels = selectedDongs.map(k => REGIONS.find(r => r.key === k)?.label ?? k);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
      {/* 헤더 */}
      <div>
        <h2 className="text-sm font-semibold text-white/80">🏘 동별 비교</h2>
        <p className="text-xs text-white/35 mt-0.5">
          {selectedDongs.length > 0
            ? `선택된 동: ${selectedDongs.map(k => REGIONS.find(r => r.key === k)?.label).join(' · ')} · 합산이 아닌 각 동의 수치를 동시에 비교합니다`
            : '위 지역 선택에서 동을 체크하면 비교 차트가 나타납니다 (최대 4개)'}
        </p>
      </div>

      {/* 선택 안 했을 때 안내 */}
      {selectedDongs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/20">
          <span className="text-4xl">☝️</span>
          <span className="text-sm">상단 지역 선택에서 동을 체크해 주세요</span>
        </div>
      )}

      {/* 차트 4개 */}
      {selectedDongs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {METRICS.map(m => (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 rounded-xl p-4"
            >
              <p className="text-xs font-semibold text-white/60 mb-3">{m.label} ({m.unit})</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }}
                    axisLine={false} tickLine={false} width={40}
                    tickFormatter={m.fmt}
                  />
                  <Tooltip content={<CustomTooltip unit={m.unit} />} />
                  {activeYear && (
                    <ReferenceLine
                      x={activeYear}
                      stroke="rgba(255,255,255,0.5)"
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                      label={{ value: `${activeYear}년`, position: 'top', fill: 'rgba(255,255,255,0.6)', fontSize: 9 }}
                    />
                  )}
                  {dongLabels.map((label, i) => (
                    <Line
                      key={label}
                      type="monotone"
                      dataKey={`${label}_${m.key}`}
                      name={label}
                      stroke={DONG_COLORS[i]}
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: DONG_COLORS[i], strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#fff', stroke: DONG_COLORS[i], strokeWidth: 2 }}
                      connectNulls
                    />
                  ))}
                  <Legend
                    formatter={(v) => {
                      const i = dongLabels.indexOf(v);
                      return <span style={{ color: DONG_COLORS[i], fontSize: 10 }}>{v}</span>;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
