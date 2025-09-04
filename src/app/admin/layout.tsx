'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AuthManager from '../../components/admin/AuthManager';
// PWA 설치는 대시보드 내 버튼으로만 제공
import ServiceWorkerRegistration from '../../components/admin/ServiceWorkerRegistration';
import { logoutClient, checkAuthClient } from '../../lib/auth';
import { User } from '../../lib/constants';
import { ToastProvider } from '../../components/Toast';
import ChunkErrorBoundary from '../../components/ChunkErrorBoundary';
import ChunkErrorHandler from '../../components/ChunkErrorHandler';
import './admin.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Error Boundary Component
class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin layout error:', error, errorInfo);
    // 에러 로깅을 위한 추가 정보
    if (typeof window !== 'undefined') {
      console.error('Current URL:', window.location.href);
      console.error('User Agent:', navigator.userAgent);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">오류가 발생했습니다</h1>
            <p className="mb-4">페이지를 새로고침해주세요.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Separate component that uses useSearchParams
const AdminLayoutContent: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 보안을 위해 페이지 로드 시 캐시 및 서비스워커 정리
        if (typeof window !== 'undefined') {
          // 서비스워커 해제
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(r => r.unregister()));
            console.log('Service workers unregistered for security');
          }
          
          // 캐시 정리
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
            console.log('Caches cleared for security');
          }
          
          // 기존 localStorage 백업 토큰 정리 (보안 강화)
          localStorage.removeItem('admin_token_backup');
          localStorage.removeItem('admin_token_time');
        }
        
        // 세션 스토리지에서 인증 상태 확인
        let sessionAuth = sessionStorage.getItem('admin_authenticated');
        
        // 보안상의 이유로 localStorage 백업 토큰 복원 로직 제거
        // 로그아웃 후에도 인증이 복원되는 보안 문제 방지
        
        if (!sessionAuth) {
          // 세션 스토리지에 없으면 로그인 페이지로 리다이렉트
          if (pathname !== '/admin/login') {
            const returnUrl = pathname;
            router.push(`/admin/login?returnUrl=${encodeURIComponent(returnUrl)}`);
          }
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          setAuthChecked(true);
          return;
        }

        // 서버에서 인증 상태 확인 (캐시 방지)
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
      
      // localStorage 백업 토큰도 완전히 정리
      localStorage.removeItem('admin_token_backup');
      localStorage.removeItem('admin_token_time');
      
      // 보안을 위해 캐시 및 서비스워커 완전 정리
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
        console.log('Service workers unregistered during logout');
      }
      
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('Caches cleared during logout');
      }
      
      // 상태 초기화
      setIsAuthenticated(false);
      setUser(null);
      
      // 로그인 페이지로 리다이렉트 (캐시 방지를 위해 버전 파라미터 추가)
      const loginUrl = `/admin/login?v=${Date.now()}`;
      router.push(loginUrl);
    } catch (error) {
      console.error('Logout error:', error);
      // 오류가 발생해도 클라이언트 상태는 정리
      logoutClient();
      sessionStorage.removeItem('admin_authenticated');
      
      // localStorage 백업 토큰도 완전히 정리
      localStorage.removeItem('admin_token_backup');
      localStorage.removeItem('admin_token_time');
      
      // 보안을 위해 캐시 정리
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }
      
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      
      setIsAuthenticated(false);
      setUser(null);
      
      const loginUrl = `/admin/login?v=${Date.now()}`;
      router.push(loginUrl);
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
    <>
      <ChunkErrorHandler />
      <ChunkErrorBoundary>
        <ToastProvider>
          <AdminErrorBoundary>
            <Suspense fallback={<AdminLayoutLoading />}>
              <AdminLayoutContent>{children}</AdminLayoutContent>
            </Suspense>
          </AdminErrorBoundary>
        </ToastProvider>
      </ChunkErrorBoundary>
    </>
  );
};

export default AdminLayout; 