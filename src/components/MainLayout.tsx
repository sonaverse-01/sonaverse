'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  // 어드민 페이지인 경우 헤더와 푸터 없이 렌더링
  if (isAdminPage) {
    return <>{children}</>;
  }

  // 일반 페이지인 경우 헤더와 푸터 포함하여 렌더링
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
} 