import { COOKIE_NAME, AuthResponse } from './constants';

/**
 * 클라이언트 사이드에서 인증 상태 확인
 * @returns 인증 상태와 사용자 정보
 */
export async function checkAuthClient(): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }
    
    const data = await response.json();
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Client auth check failed:', error);
    return { success: false, error: '인증 확인 중 오류가 발생했습니다.' };
  }
}

/**
 * 클라이언트에서 로그아웃 처리
 * 보안을 위해 서버에 로그아웃 요청을 보내야 합니다.
 */
export function logoutClient(): void {
  if (typeof document === 'undefined') return;
  
  try {
    // 쿠키를 여러 방법으로 삭제하여 확실하게 제거
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;`;
    document.cookie = `${COOKIE_NAME}=; max-age=0; path=/;`;
    document.cookie = `${COOKIE_NAME}=; max-age=0; path=/admin;`;
    
    // 세션 스토리지 정리 (localStorage는 더 이상 사용하지 않음)
    sessionStorage.removeItem('admin_authenticated');
  } catch (error) {
    console.error('Client logout failed:', error);
  }
}