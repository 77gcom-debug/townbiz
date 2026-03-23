'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

import { POPULATION_DATA, BASE_YEAR, AGE_GROUPS, YearData, AgeGroup } from '@/lib/data';
import { ALL_REGION_DATA, REGIONS, getYouthPop, getElderlyPop } from '@/lib/allRegions';
import KpiCard from '@/components/KpiCard';
import TimelineSlider from '@/components/TimelineSlider';
import AgeBarRace from '@/components/AgeBarRace';
import RegionSelector from '@/components/RegionSelector';

const DongCompareChart = dynamic(() => import('@/components/DongCompareChart'), { ssr: false });

const TotalPopChart   = dynamic(() => import('@/components/TotalPopChart'),      { ssr: false });
const AgeGroupChart   = dynamic(() => import('@/components/AgeGroupChart'),      { ssr: false });
const AvgAgeChart     = dynamic(() => import('@/components/AvgAgeChart'),        { ssr: false });
const YouthElderlyChart = dynamic(() => import('@/components/YouthElderlyChart'), { ssr: false });

const YEARS = POPULATION_DATA.map((d) => d.year);
const PLAY_INTERVAL = 900;

/** 여러 동 데이터를 연도별로 합산 */
function mergeRegionData(keys: string[]): YearData[] {
  return YEARS.map((year) => {
    const rows = keys
      .map((k) => (ALL_REGION_DATA[k] ?? POPULATION_DATA).find((d) => d.year === year))
      .filter((d): d is YearData => !!d && d.total > 0);
    if (rows.length === 0) return { year, total: 0, avgAge: 0, ages: Object.fromEntries(AGE_GROUPS.map((a) => [a, 0])) as Record<AgeGroup, number> };
    const total = rows.reduce((s, d) => s + d.total, 0);
    const ages = Object.fromEntries(
      AGE_GROUPS.map((a) => [a, rows.reduce((s, d) => s + (d.ages[a] ?? 0), 0)])
    ) as Record<AgeGroup, number>;
    const avgAge = total > 0
      ? parseFloat((rows.reduce((s, d) => s + d.avgAge * d.total, 0) / total).toFixed(2))
      : 0;
    return { year, total, avgAge, ages };
  });
}

export default function Dashboard() {
  const [activeYear, setActiveYear] = useState(YEARS[0]);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [regionKey, setRegionKey]   = useState('district');
  const [multiKeys, setMultiKeys]   = useState<string[]>([]);
  const [activeTab, setActiveTab]   = useState<'population' | 'dongCompare'>('population');

  // 멀티셀렉트 vs 단일 선택
  const isMulti = multiKeys.length > 0;
  const regionData = isMulti ? mergeRegionData(multiKeys) : (ALL_REGION_DATA[regionKey] ?? POPULATION_DATA);
  const regionLabel = isMulti
    ? multiKeys.map((k) => REGIONS.find((r) => r.key === k)?.label ?? k).join(' + ')
    : (REGIONS.find((r) => r.key === regionKey)?.label ?? '');
  const regionInfo = REGIONS.find((r) => r.key === regionKey)!;

  // 현재 연도 스냅샷 (없으면 마지막 유효 연도 사용)
  const validData  = regionData.filter((d) => d.total > 0);
  const currentData = validData.find((d) => d.year === activeYear)
    ?? validData[validData.length - 1]
    ?? POPULATION_DATA[0];

  const baseData = validData[0] ?? POPULATION_DATA[0];

  // 유소년 ↔ 고령 크로스오버 연도 계산
  const crossoverYear = (() => {
    for (let i = 1; i < validData.length; i++) {
      const prev = validData[i - 1];
      const curr = validData[i];
      const prevYouth = getYouthPop(prev);
      const prevElderly = getElderlyPop(prev);
      const currYouth = getYouthPop(curr);
      const currElderly = getElderlyPop(curr);
      if (prevYouth >= prevElderly && currYouth < currElderly) return curr.year;
      if (prevYouth <= prevElderly && currYouth > currElderly) return curr.year;
    }
    return null;
  })();

  // 자동 재생
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveYear((prev) => {
        const idx = YEARS.indexOf(prev);
        if (idx >= YEARS.length - 1) { setIsPlaying(false); return prev; }
        return YEARS[idx + 1];
      });
    }, PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleTogglePlay = useCallback(() => {
    if (!isPlaying && activeYear === YEARS[YEARS.length - 1]) setActiveYear(YEARS[0]);
    setIsPlaying((p) => !p);
  }, [isPlaying, activeYear]);

  const diffTotal   = currentData.total - baseData.total;
  const diffAvgAge  = parseFloat((currentData.avgAge - baseData.avgAge).toFixed(2));
  const diffYouth   = getYouthPop(currentData) - getYouthPop(baseData);
  const diffElderly = getElderlyPop(currentData) - getElderlyPop(baseData);

  const ageChanges = AGE_GROUPS.map((age) => ({
    age,
    diff: currentData.ages[age] - baseData.ages[age],
  })).sort((a, b) => a.diff - b.diff);

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-white font-sans selection:bg-blue-500/30">
      {/* 배경 glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-600/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-indigo-700/8 rounded-full blur-[90px]" />
      </div>

      {/* ── 고정 헤더 ── */}
      <div className="sticky top-0 z-30 bg-[#0B0F1A]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-3 flex flex-col gap-3">

          {/* 타이틀 + 탭 + 재정비교 버튼 */}
          <div className="flex items-center justify-between gap-4">
            <motion.h1
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="text-xl md:text-2xl font-black tracking-tight leading-tight shrink-0"
            >
              계양구 인구현황
              <span className="text-blue-400"> 2010–2025</span>
            </motion.h1>

            {/* 탭 메뉴 */}
            <div className="flex items-center gap-1 flex-1 justify-center">
              <button
                onClick={() => setActiveTab('population')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border ${
                  activeTab === 'population'
                    ? 'bg-blue-500/25 border-blue-400/60 text-blue-300 shadow-md shadow-blue-500/20'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 hover:border-white/20'
                }`}
              >
                📈 인구현황
              </button>
              <button
                onClick={() => setActiveTab('dongCompare')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border ${
                  activeTab === 'dongCompare'
                    ? 'bg-indigo-500/25 border-indigo-400/60 text-indigo-300 shadow-md shadow-indigo-500/20'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 hover:border-white/20'
                }`}
              >
                🏘 동별 비교
              </button>
            </div>

            <a href="/finance" className="shrink-0 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-sm text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-400 transition-all font-bold flex items-center gap-1.5">
              💰 재정비교
            </a>
          </div>

          {/* 공통 지역 선택 (항상 표시) */}
          <RegionSelector
            selectedKey={regionKey}
            onChange={(k) => { setRegionKey(k); setMultiKeys([]); }}
            multiKeys={multiKeys}
            onMultiChange={setMultiKeys}
            mode={activeTab === 'dongCompare' ? 'compare' : 'merge'}
            maxSelect={4}
            hint={activeTab === 'population'
              ? '▶ 재생 버튼으로 연도별 변화를 확인하고, 최대 4개 동을 합산해 비교합니다'
              : '동을 선택하면 아래에 비교 차트가 나타납니다 (최대 4개)'
            }
          />

          {/* 타임라인 슬라이더 - 공통 */}
          <TimelineSlider
            activeYear={activeYear}
            isPlaying={isPlaying}
            onYearChange={setActiveYear}
            onTogglePlay={handleTogglePlay}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* ══ 인구현황 탭 ══ */}
        {activeTab === 'population' && (
          <>
            {/* ── KPI 카드 ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="총 인구"       value={currentData.total}          diff={diffTotal}   diffLabel={`${baseData.year}년 대비`} unit="명"  delay={0}    />
              <KpiCard label="추정 평균연령" value={currentData.avgAge}         diff={diffAvgAge}  diffLabel={`${baseData.year}년 대비`} unit="세" decimals={2} delay={0.07} />
              <KpiCard label="유소년 인구"   value={getYouthPop(currentData)}   diff={diffYouth}   diffLabel={`${baseData.year}년 대비`} unit="명"  delay={0.14} />
              <KpiCard label="고령 인구"     value={getElderlyPop(currentData)} diff={diffElderly} diffLabel={`${baseData.year}년 대비`} unit="명"  delay={0.21} />
            </div>

            {/* ── 1순위: 총인구추이 + 평균연령추이 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white/70 mb-1">📉 총 인구 추이</h2>
                <p className="text-xs text-white/30 mb-3">
                  {baseData.total.toLocaleString()}명 ({baseData.year}) → {currentData.total.toLocaleString()}명 ({activeYear})
                </p>
                <TotalPopChart activeYear={activeYear} data={regionData} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white/70 mb-1">📈 평균연령 추이</h2>
                <p className="text-xs text-white/30 mb-3">
                  {BASE_YEAR.avgAge}세 (2010) → {currentData.avgAge}세 ({activeYear}) · 막대: 전년대비 증가
                </p>
                <AvgAgeChart activeYear={activeYear} data={regionData} />
              </motion.div>
            </div>

            {/* ── 2순위: 유소년 / 고령 인구 차트 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <h2 className="text-sm font-semibold text-white/70 mb-3">
                  👶 유소년 인구 추이
                  <span className="ml-2 text-[10px] text-[#48DBFB]/70 font-normal">0~19세</span>
                </h2>
                <YouthElderlyChart data={regionData} activeYear={activeYear} regionLabel={regionLabel} type="youth" crossoverYear={crossoverYear} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <h2 className="text-sm font-semibold text-white/70 mb-3">
                  🧓 고령 인구 추이
                  <span className="ml-2 text-[10px] text-[#FF9F43]/70 font-normal">60세 이상</span>
                </h2>
                <YouthElderlyChart data={regionData} activeYear={activeYear} regionLabel={regionLabel} type="elderly" crossoverYear={crossoverYear} />
              </motion.div>
            </div>

            {/* ── 3순위: 연령구간별 인구 + 연령별 순위 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white/70 mb-1">🏗 연령구간별 인구 (누적)</h2>
                <p className="text-xs text-white/30 mb-4">연도별 연령구간 인구 분포 변화</p>
                <AgeGroupChart activeYear={activeYear} data={regionData} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.51 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white/70 mb-1">
                  🏅 연령별 순위 · <span className="text-blue-400">{activeYear}년</span>
                  <span className="text-white/30 font-normal text-xs ml-2">({regionLabel})</span>
                </h2>
                <p className="text-xs text-white/30 mb-4">인구 많은 연령대 순으로 정렬</p>
                <AnimatePresence mode="popLayout">
                  <AgeBarRace key={`${regionKey}-${activeYear}`} data={currentData} />
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ── 요약 테이블 ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 overflow-x-auto">
              <h2 className="text-sm font-semibold text-white/70 mb-4">
                📋 연도별 전체 데이터
                <span className="ml-2 text-white/30 font-normal text-xs">{regionLabel}</span>
              </h2>
              <table className="w-full text-xs text-white/70 border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-white/40 font-medium">연도</th>
                    <th className="text-right py-2 px-3 text-white/40 font-medium">총인구</th>
                    <th className="text-right py-2 px-3 text-white/40 font-medium">전년대비</th>
                    <th className="text-right py-2 px-3 text-white/40 font-medium">증감률</th>
                    <th className="text-right py-2 px-3 text-white/40 font-medium">평균연령</th>
                    <th className="text-right py-2 px-3 text-[#48DBFB]/70 font-medium">유소년</th>
                    <th className="text-right py-2 px-3 text-[#FF9F43]/70 font-medium">고령(60+)</th>
                    <th className="text-right py-2 px-3 text-white/40 font-medium">유소년비율</th>
                    <th className="text-right py-2 px-3 text-white/40 font-medium">고령화율</th>
                  </tr>
                </thead>
                <tbody>
                  {regionData.filter((d) => d.total > 0).map((d, i, arr) => {
                    const prev = i === 0 ? null : arr[i - 1];
                    const diff = prev ? d.total - prev.total : null;
                    const rate = prev ? ((d.total / prev.total) - 1) * 100 : null;
                    const youth = getYouthPop(d);
                    const elderly = getElderlyPop(d);
                    const isActive = d.year === activeYear;
                    return (
                      <tr
                        key={d.year}
                        onClick={() => setActiveYear(d.year)}
                        className={`border-b border-white/5 cursor-pointer transition-colors ${
                          isActive ? 'bg-blue-500/15 border-blue-500/30' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className={`py-1.5 pr-4 font-bold ${isActive ? 'text-blue-400' : ''}`}>{d.year}</td>
                        <td className="text-right px-3 tabular-nums">{d.total.toLocaleString()}</td>
                        <td className={`text-right px-3 tabular-nums font-semibold ${diff === null ? '' : diff < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {diff === null ? '–' : `${diff >= 0 ? '+' : ''}${diff.toLocaleString()}`}
                        </td>
                        <td className={`text-right px-3 tabular-nums ${rate === null ? '' : rate < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {rate === null ? '–' : `${rate >= 0 ? '+' : ''}${rate.toFixed(2)}%`}
                        </td>
                        <td className="text-right px-3 tabular-nums text-orange-300">{d.avgAge > 0 ? `${d.avgAge.toFixed(2)}세` : '–'}</td>
                        <td className="text-right px-3 tabular-nums text-[#48DBFB]">{youth.toLocaleString()}</td>
                        <td className="text-right px-3 tabular-nums text-[#FF9F43]">{elderly.toLocaleString()}</td>
                        <td className="text-right px-3 tabular-nums text-white/50">
                          {d.total > 0 ? `${(youth / d.total * 100).toFixed(1)}%` : '–'}
                        </td>
                        <td className="text-right px-3 tabular-nums text-white/50">
                          {d.total > 0 ? `${(elderly / d.total * 100).toFixed(1)}%` : '–'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>

            <p className="text-center text-xs text-white/20 pb-4">
              자료출처 :{' '}
              <a href="https://jumin.mois.go.kr/" target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white/50 transition-colors">
                행정안전부 주민등록 인구통계 (jumin.mois.go.kr)
              </a>
              {' '}· 인천광역시 계양구 · 2010~2025
            </p>
          </>
        )}

        {/* ══ 동별 비교 탭 ══ */}
        {activeTab === 'dongCompare' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <DongCompareChart selectedDongs={multiKeys} activeYear={activeYear} />
          </motion.div>
        )}

      </div>
    </main>
  );
}
