'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ReferenceLine,
} from 'recharts';
import { FINANCE_DATA, YEARS, REGIONS, REGION_COLORS, METRICS } from '@/lib/financeData';

const PLAY_INTERVAL = 900;

/* ─── 지표별 쉬운 설명 ─── */
const METRIC_INSIGHTS: Record<string, { icon: string; title: string; body: string; low: string; tag: string; tagColor: string }> = {
  revenue: {
    icon: '💵',
    title: '주민 1인당 세입액',
    body: '주민 한 명이 자치구에 가져다주는 돈(지방세+세외수입)입니다. 이 수치가 높을수록 그 지역이 스스로 돈을 잘 버는 구입니다.',
    low: '이 수치가 낮으면 → 주민들이 내는 세금이 적다는 뜻. 사업체·고소득자가 적은 "베드타운"의 전형적인 특징입니다.',
    tag: '★ 핵심지표',
    tagColor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  },
  selfRate: {
    icon: '🏦',
    title: '재정자립도',
    body: '구 전체 예산 중 스스로 마련한 돈의 비율입니다. 나머지는 정부·시에서 받는 돈(교부금·보조금)으로 채웁니다.',
    low: '이 수치가 낮으면 → 중앙정부·광역시에서 돈을 받지 못하면 구가 굴러가지 않는다는 뜻. 재정 독립이 안 된 상태입니다.',
    tag: '자립 능력',
    tagColor: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  },
  autoRate: {
    icon: '🎯',
    title: '재정자주도',
    body: '자립도보다 넓은 개념으로, 지방교부세처럼 용도를 자유롭게 쓸 수 있는 돈까지 포함한 비율입니다. 구청이 "독자적으로 기획해서 쓸 수 있는 돈"의 실질 비율입니다.',
    low: '이 수치가 낮으면 → 구청이 하는 일의 대부분이 정부가 시키는 일을 집행하는 것뿐. 독자적인 행정 능력이 없는 "단순 집행 창구"입니다.',
    tag: '★ 핵심지표',
    tagColor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  },
  welfareRate: {
    icon: '🏥',
    title: '사회복지비 비중',
    body: '전체 일반회계 예산 중 복지비(기초생활·노인·장애인 등)로 나가는 돈의 비율입니다.',
    low: '이 수치가 높으면 → 예산의 절반 가까이가 복지비로 묶여, 도로·공원·일자리 등 동네 개발에 쓸 돈이 없다는 뜻입니다. "돈은 나가는데 정작 우리 동네를 키울 돈은 없다"는 근거가 됩니다.',
    tag: '⚠ 주목',
    tagColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  },
};

/* ─── 커스텀 툴팁 ─── */
function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-white/20 rounded-xl px-4 py-3 shadow-2xl text-sm min-w-[160px]">
      <p className="font-bold text-white mb-2">{label}년</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-semibold text-white">{p.value?.toLocaleString()}{unit}</span>
        </p>
      ))}
    </div>
  );
}

/* ─── KPI 카드 (순서 고정: 계양구→부평구→서구) ─── */
function KpiBlock({ label, items }: { label: string; items: { region: string; value: number; unit: string }[] }) {
  const maxVal = Math.max(...items.map(i => i.value));
  const FIXED_ORDER = ['계양구', '부평구', '서구'];
  const ordered = FIXED_ORDER.map(r => items.find(i => i.region === r)!).filter(Boolean);
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold tracking-widest uppercase text-white/40">{label}</p>
      {ordered.map((item) => (
        <div key={item.region} className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: REGION_COLORS[item.region] }} />
          <span className="text-sm font-semibold w-14 shrink-0" style={{ color: REGION_COLORS[item.region] }}>{item.region}</span>
          <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.value / maxVal) * 100}%`,
                background: REGION_COLORS[item.region],
              }}
            />
          </div>
          <span className="text-sm font-bold tabular-nums w-20 text-right" style={{ color: REGION_COLORS[item.region] }}>
            {item.value.toLocaleString()}{item.unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── 메인 페이지 ─── */
export default function FinancePage() {
  const [selectedYear, setSelectedYear] = useState(YEARS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(true);

  // 자동 재생 (페이지 로드 후 2.5초 뒤 시작)
  useEffect(() => {
    const autoStart = setTimeout(() => {
      setSelectedYear(YEARS[0]);
      setIsPlaying(true);
    }, 2500);
    return () => clearTimeout(autoStart);
  }, []);


  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSelectedYear(prev => {
        const idx = YEARS.indexOf(prev);
        if (idx >= YEARS.length - 1) { setIsPlaying(false); return prev; }
        return YEARS[idx + 1];
      });
    }, PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleTogglePlay = useCallback(() => {
    if (!isPlaying && selectedYear === YEARS[YEARS.length - 1]) setSelectedYear(YEARS[0]);
    setIsPlaying(p => !p);
  }, [isPlaying, selectedYear]);

  // 연도별 라인차트 데이터
  const lineData = YEARS.map(year => {
    const row: Record<string, any> = { year };
    REGIONS.forEach(r => {
      const d = FINANCE_DATA.find(x => x.year === year && x.region === r);
      if (d) {
        row[`${r}_revenue`]     = d.revenue;
        row[`${r}_selfRate`]    = d.selfRate;
        row[`${r}_autoRate`]    = d.autoRate;
        row[`${r}_welfareRate`] = d.welfareRate;
      }
    });
    return row;
  });

  // 선택 연도 KPI
  const yearRows = FINANCE_DATA.filter(d => d.year === selectedYear);

  // 레이더 데이터 (정규화: 각 지표 최댓값 대비 %)
  const maxRevenue    = Math.max(...FINANCE_DATA.map(d => d.revenue));
  const maxSelfRate   = Math.max(...FINANCE_DATA.map(d => d.selfRate));
  const maxAutoRate   = Math.max(...FINANCE_DATA.map(d => d.autoRate));
  const maxWelfare    = Math.max(...FINANCE_DATA.map(d => d.welfareRate));

  const radarData = [
    { metric: '세입액', ...Object.fromEntries(yearRows.map(d => [d.region, +(d.revenue / maxRevenue * 100).toFixed(1)])) },
    { metric: '재정자립도', ...Object.fromEntries(yearRows.map(d => [d.region, +(d.selfRate / maxSelfRate * 100).toFixed(1)])) },
    { metric: '재정자주도', ...Object.fromEntries(yearRows.map(d => [d.region, +(d.autoRate / maxAutoRate * 100).toFixed(1)])) },
    { metric: '복지비비중', ...Object.fromEntries(yearRows.map(d => [d.region, +(d.welfareRate / maxWelfare * 100).toFixed(1)])) },
  ];

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-white font-sans">
      {/* 배경 glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/8 rounded-full blur-[100px]" />
      </div>

      {/* ── 고정 헤더 ── */}
      <div className="sticky top-0 z-30 bg-[#0B0F1A]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-3 flex flex-col gap-3">

          {/* 타이틀 + 이동버튼 + 접기 */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-lg md:text-3xl font-black tracking-tight leading-tight">
                인천 3개구 재정지표 비교
                <span className="text-emerald-400"> 2010–2025</span>
              </h1>
              <p className="text-xs text-white/40 mt-0.5 hidden md:block">계양구 · 부평구 · 서구 · 재정자립도 · 재정자주도 · 사회복지비 비중</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/"
                className="px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl bg-blue-500/15 border border-blue-500/40 text-xs md:text-sm text-blue-400 hover:bg-blue-500/30 hover:border-blue-400 transition-all font-bold flex items-center gap-1.5"
              >
                <span className="text-blue-300">←</span> <span>인구현황</span>
              </Link>
              {/* 헤더 접기/펼치기 — 접혀있는 동안 항상 강조 */}
              <div className="relative">
                <button
                  onClick={() => setHeaderCollapsed(v => !v)}
                  title={headerCollapsed ? '헤더 펼치기' : '헤더 접기'}
                  className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl border transition-all text-xs font-bold ${
                    headerCollapsed
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-400 animate-pulse'
                      : 'bg-white/5 border-white/15 text-white/50 hover:bg-white/10 hover:text-white/80 hover:border-white/30'
                  }`}
                >
                  <motion.svg
                    animate={{ rotate: headerCollapsed ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </motion.svg>
                  <span className="hidden sm:inline">{headerCollapsed ? '펼치기' : '접기'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 접혔을 때 요약 바 */}
          <AnimatePresence initial={false}>
            {headerCollapsed && (
              <motion.div
                key="collapsed-bar"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 py-1">
                  <span className="text-sm font-semibold text-white/70">
                    📊 재정지표 비교 · <span className="text-emerald-400">{selectedYear}년</span>
                  </span>
                  <button
                    onClick={handleTogglePlay}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      isPlaying
                        ? 'bg-orange-500/20 border-orange-400/50 text-orange-300'
                        : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                    }`}
                  >
                    {isPlaying ? '⏸ 정지' : '▶ 재생'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 재생 버튼 + 연도 선택 — 접기 가능 */}
          <AnimatePresence initial={false}>
            {!headerCollapsed && (
              <motion.div
                key="header-controls"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {/* 재생/정지 버튼 */}
                  <button
                    onClick={handleTogglePlay}
                    className={`relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black transition-all shrink-0 border ${
                      isPlaying
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/40'
                        : 'bg-white/5 border-white/20 text-white/80 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400'
                    }`}
                    title={isPlaying ? '정지' : '재생'}
                  >
                    {isPlaying
                      ? <span className="flex gap-0.5"><span className="w-1 h-4 bg-white rounded-sm" /><span className="w-1 h-4 bg-white rounded-sm" /></span>
                      : <svg viewBox="0 0 16 16" className="w-4 h-4 ml-0.5" fill="currentColor"><polygon points="3,1 15,8 3,15" /></svg>
                    }
                  </button>

                  {/* 연도 버튼 */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {YEARS.map(y => (
                      <button
                        key={y}
                        onClick={() => { setIsPlaying(false); setSelectedYear(y); }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedYear === y
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>

                  {/* 현재 연도 표시 */}
                  <span className="ml-auto text-2xl font-black text-emerald-400 tabular-nums shrink-0">
                    {selectedYear}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* ── KPI 순위 카드 (선택 연도) ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {METRICS.map(m => (
              <KpiBlock
                key={m.key}
                label={m.label}
                items={yearRows.map(d => ({
                  region: d.region,
                  value: d[m.key as keyof typeof d] as number,
                  unit: m.unit,
                }))}
              />
            ))}
          </div>
        </motion.div>

        {/* ── 레이더 차트 ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            {/* 좌우 2분할 */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
              {/* 좌측: 레이더 차트 */}
              <div className="w-full md:w-1/2 shrink-0">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                    {REGIONS.map(r => (
                      <Radar key={r} name={r} dataKey={r} stroke={REGION_COLORS[r]} fill={REGION_COLORS[r]} fillOpacity={0.15} strokeWidth={2} />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 우측: 제목 + 설명 + 범례 */}
              <div className="w-full md:w-1/2 flex flex-col gap-4 justify-center">
                <div>
                  <h2 className="text-base font-bold text-white/85">🕸️ {selectedYear}년 종합 비교</h2>
                  <p className="text-xs text-white/35 mt-1 leading-relaxed">
                    각 지표를 최댓값 기준으로 정규화한 상대적 비교 —<br />
                    <span className="text-white/50">면적이 넓을수록 해당 구의 재정이 강합니다</span>
                  </p>
                </div>
                {/* 범례 */}
                <div className="flex flex-col gap-2">
                  {REGIONS.map(r => {
                    const row = yearRows.find(d => d.region === r);
                    return (
                      <div key={r} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: `${REGION_COLORS[r]}10`, border: `1px solid ${REGION_COLORS[r]}25` }}>
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: REGION_COLORS[r] }} />
                        <span className="text-sm font-bold w-14 shrink-0" style={{ color: REGION_COLORS[r] }}>{r}</span>
                        {row && (
                          <span className="text-xs text-white/40">
                            세입 <span className="text-white/65 font-semibold">{row.revenue}천원</span>
                            {' · '}자립 <span className="text-white/65 font-semibold">{row.selfRate}%</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-white/20 leading-relaxed">
                  ※ 레이더 수치는 전체 연도·전체 구 기준 최댓값 대비 상대값(%)
                </p>
              </div>
            </div>
            {/* 종합 총평 */}
            <div className="mt-4 rounded-xl border border-white/10 overflow-hidden text-xs leading-relaxed">
              {/* 접기/펴기 헤더 */}
              <button
                onClick={() => setSummaryOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <p className="font-bold text-white/90 text-sm">📌 계양구 · 부평구 · 서구 재정 종합 총평 (2010–2025)</p>
                <span className={`text-white/40 text-base transition-transform duration-300 ${summaryOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

            {summaryOpen && <div className="p-5 bg-white/5 space-y-4">

              {/* 서구 */}
              <div className="space-y-1">
                <p className="font-bold text-[#1DD1A1]">🟢 서구 — 3개구 중 유일한 고성장 구</p>
                <p className="text-white/60">
                  2010년 주민1인당 세입액 <span className="text-white/80 font-semibold">140천원</span>으로 3개구 중 최하위였던 서구는
                  2025년 <span className="text-white/80 font-semibold">565천원</span>으로 무려 <span className="text-[#1DD1A1] font-bold">+304% 폭등</span>하며 압도적 1위로 역전했습니다.
                  청라국제도시·검단신도시 등 대규모 개발로 사업체와 고소득 인구가 유입된 결과입니다.
                  재정자립도도 <span className="text-white/80 font-semibold">17.4% → 16.4%</span>로 3개구 중 가장 적게 하락했으며,
                  사회복지비 비중도 <span className="text-white/80 font-semibold">9.01%</span>로 가장 낮아 개발·사업에 쓸 여유 재원이 가장 많습니다.
                  한마디로, <span className="text-[#1DD1A1] font-semibold">스스로 성장하는 구</span>입니다.
                </p>
              </div>

              {/* 계양구 */}
              <div className="space-y-1">
                <p className="font-bold text-[#6366f1]">🟣 계양구 — 복지 부담 가장 높은 정체된 구</p>
                <p className="text-white/60">
                  2010년 세입액 <span className="text-white/80 font-semibold">154천원</span>에서 2025년 <span className="text-white/80 font-semibold">372천원</span>으로
                  <span className="text-[#6366f1] font-semibold"> +142% 증가</span>했지만, 같은 기간 서구 대비 성장세는 절반에도 못 미칩니다.
                  특히 사회복지비 비중이 <span className="text-white/80 font-semibold">8.31% → 13.67%</span>로
                  <span className="text-rose-400 font-bold"> 3개구 중 가장 높아</span>, 예산의 상당 부분이 복지비로 고정 지출됩니다.
                  재정자립도는 <span className="text-white/80 font-semibold">19.87% → 15.37%</span>로 내리막이며,
                  세입액도 서구와의 격차가 2010년 14천원에서 2025년 <span className="text-rose-400 font-semibold">193천원</span>으로 크게 벌어졌습니다.
                  지역 개발이나 일자리 창출에 쓸 독자 재원이 점점 줄어드는 구조입니다.
                </p>
              </div>

              {/* 부평구 */}
              <div className="space-y-1">
                <p className="font-bold text-[#FF9F43]">🟠 부평구 — 재정자립도 최하위 붕괴</p>
                <p className="text-white/60">
                  세입액은 <span className="text-white/80 font-semibold">143천원 → 376천원</span>으로 계양구와 비슷한 수준이지만,
                  재정자립도가 <span className="text-white/80 font-semibold">18.35% → 9.91%</span>로
                  <span className="text-rose-400 font-bold"> 거의 반 토막</span>이 났습니다. 3개구 중 단연 최저입니다.
                  즉, 부평구는 스스로 마련하는 돈의 비율이 갈수록 줄고 있으며, 중앙정부·광역시의 지원 없이는 사실상 운영이 어려운 상태입니다.
                  인구 규모는 3개구 중 가장 크지만, 재정 자생력은 역설적으로 가장 취약합니다.
                </p>
              </div>

              {/* 공통 */}
              <div className="border-t border-white/10 pt-3 space-y-1">
                <p className="font-bold text-white/70">⚖ 3개구 공통 흐름</p>
                <p className="text-white/50">
                  세 구 모두 재정자립도는 내리막이고, 사회복지비 비중은 오르막입니다.
                  재정자주도는 상승했지만 이는 중앙에서 내려주는 교부세가 늘었기 때문으로,
                  자생력 강화와는 거리가 있습니다. 결국 <span className="text-white/70 font-semibold">서구만이 실질적 성장을 이룬 반면,
                  계양구와 부평구는 중앙 의존도가 심화되는 구조적 정체</span>에 빠져 있습니다.
                </p>
              </div>
            </div>}
            </div>
          </div>
        </motion.div>

        {/* ── 라인차트 4개 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {METRICS.map((m, i) => {
            const insight = METRIC_INSIGHTS[m.key];
            return (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3"
              >
                {/* 제목 + 태그 */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-white/80">{insight.icon} {insight.title}</h2>
                    <p className="text-xs text-white/30 mt-0.5">{m.desc}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${insight.tagColor}`}>
                    {insight.tag}
                  </span>
                </div>

                {/* 차트 */}
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={lineData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                      axisLine={false} tickLine={false} width={38}
                      tickFormatter={v => m.unit === '천원' ? `${v}` : `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip unit={m.unit} />} />
                    <ReferenceLine x={selectedYear} stroke="rgba(52,211,153,0.5)" strokeDasharray="4 3" strokeWidth={2} />
                    {REGIONS.map(r => (
                      <Line
                        key={r}
                        type="monotone"
                        dataKey={`${r}_${m.key}`}
                        name={r}
                        stroke={REGION_COLORS[r]}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: REGION_COLORS[r], strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#fff', stroke: REGION_COLORS[r], strokeWidth: 2 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>

                {/* 해설 박스 */}
                <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-1.5">
                  <p className="text-xs text-white/55 leading-relaxed">{insight.body}</p>
                  <p className="text-xs text-amber-400/80 leading-relaxed font-medium">{insight.low}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── 바차트: 주민1인당 세입액 연도별 ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white/70 mb-1">💰 주민1인당 세입액 연도별 비교</h2>
          <p className="text-xs text-white/30 mb-4">단위: 천원</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={lineData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barGap={2} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} width={38} />
              <Tooltip content={<CustomTooltip unit="천원" />} />
              {REGIONS.map(r => (
                <Bar key={r} dataKey={`${r}_revenue`} name={r} fill={REGION_COLORS[r]} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── 추가 분석 포인트 ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <h2 className="text-sm font-semibold text-white/60 mb-3">🔍 추가로 살펴볼 지표</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">

            {/* 행정운영경비비중 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏢</span>
                  <h3 className="text-sm font-bold text-white/80">행정운영경비 비중 (일반회계)</h3>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border text-orange-400 bg-orange-400/10 border-orange-400/30">
                  ⚠ 주목
                </span>
              </div>
              <p className="text-xs text-white/55 leading-relaxed">
                공무원 인건비·청사 유지비 등 구청 조직을 운영하는 데 쓰이는 고정비의 비율입니다.
                주민을 위한 사업이 아니라 구청 자체를 유지하는 데 드는 비용입니다.
              </p>
              <div className="bg-black/20 rounded-xl px-4 py-3 border border-white/5">
                <p className="text-xs text-amber-400/80 leading-relaxed font-medium">
                  이 비중이 높으면 → 전체 예산 대비 주민을 위한 사업비가 줄어든다는 뜻.
                  "구청이 주민을 위해 일하는 게 아니라, 구청 조직 자체를 유지하는 데 급급한 비효율적 구조"라는 비판 근거가 됩니다.
                </p>
              </div>
              <p className="text-[10px] text-white/25 mt-1">
                ※ 해당 수치는 행정안전부 지방재정365(lofin.mois.go.kr)에서 연도별 데이터를 확인할 수 있습니다.
              </p>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-white/35 leading-relaxed">
                📋 위 4가지 지표(세입액·재정자립도·재정자주도·복지비비중)와 행정운영경비비중을 종합하면,
                <span className="text-white/60 font-semibold"> "계양구가 스스로 돈을 못 벌고, 정부 의존도는 높으며, 예산 대부분이 복지·인건비로 고정 지출되어 실질적인 지역 개발 여력이 없다"</span>는
                구조적 문제를 숫자로 입증할 수 있습니다.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 출처 */}
        <p className="text-center text-xs text-white/20 pb-4">
          자료출처 : 행정안전부 지방재정365 · 인천광역시 계양구·부평구·서구 · 2010~2025
        </p>
      </div>
    </main>
  );
}
