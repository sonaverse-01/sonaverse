/**
 * 인증 관련 상수 정의
 * 보안을 위해 환경변수 사용을 권장합니다.
 */

export const JWT_SECRET = process.env.JWT_SECRET;
export const COOKIE_NAME = 'admin_token';

/**
 * 쿠키 옵션 설정
 * 보안을 위해 항상 HTTPS 사용을 권장합니다.
 * 브라우저 세션 종료 시 쿠키도 함께 삭제되도록 설정
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // 일단 secure를 false로 설정하여 테스트
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 8 * 60 * 60, // 8시간
  // domain 제거하여 현재 도메인에만 적용
};

/**
 * 사용자 타입 정의
 */
export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * 인증 응답 타입 정의
 */
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
} 