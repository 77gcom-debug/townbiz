export interface FinanceRecord {
  year: number;
  region: '계양구' | '부평구' | '서구';
  revenue: number;    // 주민1인당 세입액 (천원)
  selfRate: number;   // 재정자립도 (%)
  autoRate: number;   // 재정자주도 (%)
  welfareRate: number; // 사회복지비 비중 (%)
}

export const FINANCE_DATA: FinanceRecord[] = [
  { year:2025, region:'부평구', revenue:376, selfRate:9.91,  autoRate:71.57, welfareRate:11.92 },
  { year:2025, region:'계양구', revenue:372, selfRate:15.37, autoRate:66.75, welfareRate:13.67 },
  { year:2025, region:'서구',   revenue:565, selfRate:16.36, autoRate:63.48, welfareRate:9.01  },
  { year:2024, region:'부평구', revenue:374, selfRate:11.6,  autoRate:69.02, welfareRate:12.54 },
  { year:2024, region:'계양구', revenue:362, selfRate:15.39, autoRate:66.93, welfareRate:13.59 },
  { year:2024, region:'서구',   revenue:558, selfRate:16.15, autoRate:63.68, welfareRate:9.31  },
  { year:2023, region:'부평구', revenue:375, selfRate:13.22, autoRate:65.04, welfareRate:12.73 },
  { year:2023, region:'계양구', revenue:362, selfRate:17.97, autoRate:64.48, welfareRate:13.62 },
  { year:2023, region:'서구',   revenue:610, selfRate:18.53, autoRate:57.29, welfareRate:10.45 },
  { year:2022, region:'부평구', revenue:305, selfRate:12.07, autoRate:62.34, welfareRate:14.24 },
  { year:2022, region:'계양구', revenue:307, selfRate:16.71, autoRate:62.37, welfareRate:15.05 },
  { year:2022, region:'서구',   revenue:481, selfRate:17.5,  autoRate:57.6,  welfareRate:10.72 },
  { year:2021, region:'부평구', revenue:270, selfRate:12.45, autoRate:65.49, welfareRate:13.4  },
  { year:2021, region:'계양구', revenue:274, selfRate:14.84, autoRate:66.42, welfareRate:14.43 },
  { year:2021, region:'서구',   revenue:386, selfRate:16.41, autoRate:59.64, welfareRate:10.08 },
  { year:2020, region:'부평구', revenue:248, selfRate:11.65, autoRate:63.39, welfareRate:14.83 },
  { year:2020, region:'계양구', revenue:258, selfRate:13.35, autoRate:63.64, welfareRate:15.13 },
  { year:2020, region:'서구',   revenue:333, selfRate:14.98, autoRate:59.45, welfareRate:11.57 },
  { year:2019, region:'부평구', revenue:225, selfRate:12.5,  autoRate:61.93, welfareRate:15.09 },
  { year:2019, region:'계양구', revenue:235, selfRate:13.98, autoRate:62.36, welfareRate:15.43 },
  { year:2019, region:'서구',   revenue:287, selfRate:16.03, autoRate:59.19, welfareRate:12.44 },
  { year:2018, region:'부평구', revenue:208, selfRate:12.41, autoRate:60.93, welfareRate:15.9  },
  { year:2018, region:'계양구', revenue:223, selfRate:13.62, autoRate:60.62, welfareRate:15.97 },
  { year:2018, region:'서구',   revenue:264, selfRate:15.47, autoRate:57.5,  welfareRate:12.61 },
  { year:2017, region:'부평구', revenue:190, selfRate:12.35, autoRate:58.11, welfareRate:16.6  },
  { year:2017, region:'계양구', revenue:209, selfRate:13.56, autoRate:58.18, welfareRate:16.47 },
  { year:2017, region:'서구',   revenue:240, selfRate:15.23, autoRate:55.91, welfareRate:13.09 },
  { year:2016, region:'부평구', revenue:182, selfRate:13.14, autoRate:56.42, welfareRate:16.5  },
  { year:2016, region:'계양구', revenue:196, selfRate:14.38, autoRate:56.48, welfareRate:15.97 },
  { year:2016, region:'서구',   revenue:219, selfRate:15.43, autoRate:54.65, welfareRate:13.08 },
  { year:2015, region:'부평구', revenue:171, selfRate:14.24, autoRate:54.49, welfareRate:16.2  },
  { year:2015, region:'계양구', revenue:183, selfRate:15.05, autoRate:54.65, welfareRate:15.73 },
  { year:2015, region:'서구',   revenue:196, selfRate:14.87, autoRate:52.11, welfareRate:13.39 },
  { year:2014, region:'부평구', revenue:166, selfRate:14.56, autoRate:52.51, welfareRate:15.49 },
  { year:2014, region:'계양구', revenue:178, selfRate:15.92, autoRate:53.19, welfareRate:14.65 },
  { year:2014, region:'서구',   revenue:182, selfRate:15.28, autoRate:51.61, welfareRate:13.32 },
  { year:2013, region:'부평구', revenue:160, selfRate:15.12, autoRate:51.81, welfareRate:14.04 },
  { year:2013, region:'계양구', revenue:169, selfRate:16.2,  autoRate:52.42, welfareRate:13.35 },
  { year:2013, region:'서구',   revenue:166, selfRate:15.19, autoRate:50.6,  welfareRate:12.28 },
  { year:2012, region:'부평구', revenue:153, selfRate:16.87, autoRate:51.87, welfareRate:12.7  },
  { year:2012, region:'계양구', revenue:163, selfRate:18.05, autoRate:52.9,  welfareRate:11.83 },
  { year:2012, region:'서구',   revenue:157, selfRate:16.12, autoRate:49.89, welfareRate:11.15 },
  { year:2011, region:'부평구', revenue:151, selfRate:17.94, autoRate:51.83, welfareRate:10.3  },
  { year:2011, region:'계양구', revenue:159, selfRate:18.8,  autoRate:52.97, welfareRate:9.89  },
  { year:2011, region:'서구',   revenue:155, selfRate:16.48, autoRate:49.82, welfareRate:9.87  },
  { year:2010, region:'부평구', revenue:143, selfRate:18.35, autoRate:49.19, welfareRate:8.69  },
  { year:2010, region:'계양구', revenue:154, selfRate:19.87, autoRate:50.61, welfareRate:8.31  },
  { year:2010, region:'서구',   revenue:140, selfRate:17.4,  autoRate:47.02, welfareRate:8.42  },
];

export const YEARS = [...new Set(FINANCE_DATA.map(d => d.year))].sort((a,b) => a - b);
export const REGIONS = ['계양구', '부평구', '서구'] as const;

export const REGION_COLORS: Record<string, string> = {
  '계양구': '#6366f1',
  '부평구': '#FF9F43',
  '서구':   '#1DD1A1',
};

export const METRICS = [
  { key: 'revenue',     label: '주민1인당 세입액', unit: '천원', desc: '주민 1명당 자치단체 세입액' },
  { key: 'selfRate',    label: '재정자립도',       unit: '%',   desc: '지방세+세외수입/일반회계예산' },
  { key: 'autoRate',    label: '재정자주도',       unit: '%',   desc: '자체재원+자주재원/일반회계예산' },
  { key: 'welfareRate', label: '사회복지비 비중',  unit: '%',   desc: '일반회계 대비 사회복지비 비중' },
] as const;
