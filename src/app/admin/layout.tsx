'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AuthManager from '../../components/admin/AuthManager';
// PWA 설치는 대시보드 내 버튼으로만 제공
import ServiceWorkerRegistration from '../../components/admin/ServiceWorkerRegistration';
import { logoutClient, checkAuthClient } from '../../lib/auth';
import { User } from '../../lib/constants';
import './admin.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Separate component that uses useSearchParams
const AdminLayoutContent: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 세션 스토리지에서 인증 상태 확인
        const sessionAuth = sessionStorage.getItem('admin_authenticated');
        
        if (!sessionAuth) {
          // 세션 스토리지에 인증 상태가 없으면 로그인 페이지로 리다이렉트
          if (pathname !== '/admin/login') {
            // URL 인코딩 문제 수정: 이미 인코딩된 URL이 아닌 원본 pathname 사용
            const returnUrl = pathname;
            router.push(`/admin/login?returnUrl=${encodeURIComponent(returnUrl)}`);
          }
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          setAuthChecked(true);
          return;
        }

        // 서버에서 인증 상태 확인
        const authResult = await checkAuthClient();

        if (authResult.success && authResult.user) {
          setIsAuthenticated(true);
          setUser(authResult.user);
        } else {
          // 인증되지 않은 경우 세션 스토리지 정리
          sessionStorage.removeItem('admin_authenticated');
          
          if (pathname !== '/admin/login') {
            // URL 인코딩 문제 수정: 이미 인코딩된 URL이 아닌 원본 pathname 사용
            const returnUrl = pathname;
            router.push(`/admin/login?returnUrl=${encodeURIComponent(returnUrl)}`);
          }
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // 오류 발생 시 세션 스토리지 정리
        sessionStorage.removeItem('admin_authenticated');
        
        if (pathname !== '/admin/login') {
          // URL 인코딩 문제 수정: 이미 인코딩된 URL이 아닌 원본 pathname 사용
          const returnUrl = pathname;
          router.push(`/admin/login?returnUrl=${encodeURIComponent(returnUrl)}`);
        }
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };

    // 미들웨어에서 이미 인증을 확인했으므로 클라이언트에서는 간단한 확인만
    if (!authChecked) {
      checkAuth();
    }
  }, [pathname, router, authChecked]);

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('로그아웃 요청 실패');
      }
      
      // 클라이언트에서도 로그아웃 처리
      logoutClient();
      
      // 세션 스토리지에서 인증 상태 제거
      sessionStorage.removeItem('admin_authenticated');
      
      // 상태 초기화
      setIsAuthenticated(false);
      setUser(null);
      
      // 로그인 페이지로 리다이렉트
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // 오류가 발생해도 클라이언트 상태는 정리
      logoutClient();
      sessionStorage.removeItem('admin_authenticated');
      setIsAuthenticated(false);
      setUser(null);
      router.push('/admin/login');
    }
  };

  // 로그인 페이지는 별도 레이아웃 사용
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 로딩 화면 유지 (리다이렉트 처리 중)
  if (!isAuthenticated && authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthManager>
      <ServiceWorkerRegistration />
      <div className="flex h-screen bg-gray-900 overflow-hidden">
        <AdminSidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 bg-gray-900 overflow-auto lg:ml-0">
          <main className="p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthManager>
  );
};

// Loading component for Suspense fallback
const AdminLayoutLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">로딩 중...</p>
    </div>
  </div>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Suspense fallback={<AdminLayoutLoading />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
};

export default AdminLayout; 