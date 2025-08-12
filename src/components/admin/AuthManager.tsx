'use client';

import { useEffect, useRef } from 'react';

interface AuthManagerProps {
  children: React.ReactNode;
}

/**
 * 인증 관리 컴포넌트
 * 세션 쿠키를 기반으로 브라우저 종료시에만 자동 로그아웃됩니다.
 * 페이지 이동, 새로고침은 완전히 허용하고 인증 상태를 유지합니다.
 */
const AuthManager: React.FC<AuthManagerProps> = ({ children }) => {
  const visibilityTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 오랜 시간 비활성 상태 감지만 처리
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 2시간 후에도 페이지가 숨겨져 있으면 비활성 상태로 간주
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
        }, 2 * 60 * 60 * 1000); // 2시간 후 비활성 로그아웃
      } else if (document.visibilityState === 'visible') {
        // 페이지가 다시 보이면 타이머 취소
        if (visibilityTimer.current) {
          clearTimeout(visibilityTimer.current);
          visibilityTimer.current = undefined;
        }
      }
    };

    // 비활성 감지만 등록
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (visibilityTimer.current) {
        clearTimeout(visibilityTimer.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <>{children}</>;
};

export default AuthManager; 