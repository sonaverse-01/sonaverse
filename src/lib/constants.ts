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
  secure: process.env.NODE_ENV === 'production', // 프로덕션에서만 HTTPS 강제
  sameSite: 'strict' as const,
  path: '/',
  // 명시적으로 세션 쿠키로 설정 (브라우저 종료 시 자동 삭제)
  // maxAge나 expires를 설정하지 않으면 세션 쿠키가 됨
  // 도메인은 기본적으로 호스트 한정 쿠키(HostOnly)로 두어 www/apex 불일치 이슈를 방지
  // 필요 시 환경변수로 강제 지정(.sonaverse.kr 형태 권장)
  domain: process.env.COOKIE_DOMAIN || undefined
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