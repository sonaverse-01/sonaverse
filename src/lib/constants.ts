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
  sameSite: 'lax' as const, // 페이지 이동시 쿠키 유지를 위해 lax 사용
  path: '/',
  // 배포 환경에서 쿠키 지속성을 위해 maxAge 설정 (8시간)
  maxAge: process.env.NODE_ENV === 'production' ? 8 * 60 * 60 : undefined, // 프로덕션: 8시간, 개발: 세션
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