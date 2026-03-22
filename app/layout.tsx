import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '연령별 인구현황 대시보드 | 인천 계양구 2010–2025',
  description: '인천광역시 계양구 연령별 인구 증감, 평균연령 변화 시각화 대시보드',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
