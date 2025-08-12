'use client';

import { useEffect, useRef } from 'react';

interface AuthManagerProps {
  children: React.ReactNode;
}

/**
 * 인증 관리 컴포넌트
 * 브라우저가 완전히 닫힐 때만 로그아웃을 처리합니다.
 * 새로고침이나 탭 이동은 허용합니다.
 */
const AuthManager: React.FC<AuthManagerProps> = ({ children }) => {
  const isLoggingOut = useRef(false);
  const visibilityTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 브라우저 완전 종료 시에만 세션 스토리지 정리
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // 새로고침이나 일반 페이지 이동은 허용
      // 오직 브라우저 종료시에만 정리
      try {
        // 세션 스토리지 정리는 브라우저가 자동으로 처리
        if (navigator.sendBeacon && event.type === 'beforeunload') {
          navigator.sendBeacon('/api/auth/logout', JSON.stringify({ reason: 'browser_close' }));
        }
      } catch (error) {
        console.error('Beforeunload cleanup error:', error);
      }
    };

    // 페이지가 숨겨졌을 때 타이머 설정
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isLoggingOut.current) {
        // 30초 후에도 페이지가 숨겨져 있으면 비활성 상태로 간주
        visibilityTimer.current = setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            try {
              if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/auth/logout', JSON.stringify({ reason: 'long_inactive' }));
              }
            } catch (error) {
              console.error('Long inactivity logout error:', error);
            }
          }
        }, 30000); // 30초 후 비활성 로그아웃
      } else if (document.visibilityState === 'visible') {
        // 페이지가 다시 보이면 타이머 취소
        if (visibilityTimer.current) {
          clearTimeout(visibilityTimer.current);
          visibilityTimer.current = undefined;
        }
      }
    };

    // 이벤트 리스너 등록 (beforeunload만 사용)
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 컴포넌트 언마운트 시 정리
    return () => {
      isLoggingOut.current = true;
      if (visibilityTimer.current) {
        clearTimeout(visibilityTimer.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <>{children}</>;
};

export default AuthManager; 