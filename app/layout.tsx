import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = 'https://dat.townbiz.co.kr';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: '연령별 인구현황 대시보드 | 인천 계양구 2010–2025',
  description: '인천광역시 계양구 연령별 인구 증감, 평균연령 변화 시각화 대시보드. 2010년부터 2025년까지 읍면동별 인구 추이, 연령 구조, 평균연령 변화를 한눈에 확인하세요.',
  keywords: ['인천 계양구 인구', '계양구 인구현황', '인구 대시보드', '연령별 인구', '인구 감소', '고령화', '인천시 인구통계', '계양구 읍면동 인구'],
  authors: [{ name: 'TownBiz', url: BASE_URL }],
  creator: 'TownBiz',
  publisher: 'TownBiz',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: '계양구 인구현황 대시보드',
    title: '연령별 인구현황 대시보드 | 인천 계양구 2010–2025',
    description: '인천광역시 계양구 연령별 인구 증감, 평균연령 변화 시각화 대시보드',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '연령별 인구현황 대시보드 | 인천 계양구 2010–2025',
    description: '인천광역시 계양구 연령별 인구 증감, 평균연령 변화 시각화 대시보드',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8C8ZXWV47H" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8C8ZXWV47H');
            `,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
