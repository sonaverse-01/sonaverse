'use client';

import { useEffect, useRef } from 'react';
import { logoutClient } from '../../lib/auth';

interface AuthManagerProps {
  children: React.ReactNode;
}

/**
 * 인증 관리 컴포넌트
 * 브라우저 탭이 닫힐 때만 토큰을 해제하는 기능을 제공합니다.
 * 보안과 사용자 경험을 모두 고려합니다.
 */
const AuthManager: React.FC<AuthManagerProps> = ({ children }) => {
  const isLoggingOut = useRef(false);

  useEffect(() => {
    // 브라우저 종료 감지를 위한 다중 이벤트 처리
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isLoggingOut.current) {
        try {
          // 세션 스토리지에서 인증 상태 제거
          sessionStorage.removeItem('admin_authenticated');
          
          // Navigator.sendBeacon을 사용하여 확실한 로그아웃 요청
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/auth/logout', JSON.stringify({ reason: 'browser_close' }));
          }
          
          // 백업으로 클라이언트 로그아웃도 실행
          logoutClient();
        } catch (error) {
          console.error('Beforeunload logout error:', error);
        }
      }
    };

    // 페이지 언로드 시 확실한 정리
    const handleUnload = () => {
      if (!isLoggingOut.current) {
        try {
          sessionStorage.removeItem('admin_authenticated');
          logoutClient();
          
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/auth/logout', JSON.stringify({ reason: 'page_unload' }));
          }
        } catch (error) {
          console.error('Unload logout error:', error);
        }
      }
    };

    // 페이지 숨김 감지 (탭 닫기, 브라우저 최소화 등)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isLoggingOut.current) {
        // 페이지가 숨겨진 상태에서 일정 시간 후 로그아웃
        setTimeout(() => {
          if (document.visibilityState === 'hidden' && !document.hasFocus()) {
            try {
              sessionStorage.removeItem('admin_authenticated');
              
              if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/auth/logout', JSON.stringify({ reason: 'page_hidden' }));
              }
              
              logoutClient();
            } catch (error) {
              console.error('Visibility change logout error:', error);
            }
          }
        }, 2000); // 2초 지연으로 탭 전환과 구분
      }
    };

    // 페이지 포커스 복원 시 토큰 유효성 확인
    const handleFocus = () => {
      // 세션 쿠키 기반이므로 별도 확인 불필요
    };

    // 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      isLoggingOut.current = true;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return <>{children}</>;
};

export default AuthManager; 