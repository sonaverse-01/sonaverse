import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET, COOKIE_NAME } from './lib/constants';
import { analyticsMiddleware } from './middleware/analytics';

/**
 * JWT 토큰 검증 (미들웨어용 - Edge Runtime 호환)
 * @param token - 검증할 JWT 토큰
 * @returns 검증된 사용자 정보 또는 null
 */
async function verifyToken(token: string): Promise<any> {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'sonaverse-admin',
      audience: 'admin-users'
    });
    return payload;
  } catch (error) {
    console.error('Token verification failed in middleware:', error);
    return null;
  }
}

/**
 * Next.js 미들웨어
 * 관리자 페이지 접근 시 인증을 확인하고 리다이렉트를 처리합니다.
 * 보안을 위해 엄격한 검증을 수행합니다.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 방문자 분석 로깅
  analyticsMiddleware(request);

  // SEO를 위한 언어 감지 (Admin 페이지와 API는 제외)
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/')) {
    // Accept-Language 헤더에서 선호 언어 감지
    const acceptLanguage = request.headers.get('Accept-Language');
    const preferredLanguage = acceptLanguage?.includes('en') ? 'en' : 'ko';
    
    // 언어 쿠키가 없으면 설정
    const response = NextResponse.next();
    if (!request.cookies.get('NEXT_LOCALE')) {
      response.cookies.set('NEXT_LOCALE', preferredLanguage, {
        maxAge: 365 * 24 * 60 * 60, // 1년
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
    
    // HTML 응답에 hreflang 및 canonical 헤더 추가
    if (pathname !== '/admin/login' && !pathname.startsWith('/api/')) {
      response.headers.set('Link', [
        `<https://sonaverse.kr${pathname}>; rel="canonical"`,
        `<https://sonaverse.kr/ko${pathname}>; rel="alternate"; hreflang="ko"`,
        `<https://sonaverse.kr/en${pathname}>; rel="alternate"; hreflang="en"`,
        `<https://sonaverse.kr${pathname}>; rel="alternate"; hreflang="x-default"`
      ].join(', '));
    }
    
    // SEO 최적화가 적용된 response 반환
    if (response.headers.get('Link')) {
      return response;
    }
  }

  // 관리자 페이지 경로 확인 (로그인 페이지 제외)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    try {
      // 쿠키에서 토큰 가져오기 (COOKIE_NAME 상수 사용)
      const token = request.cookies.get(COOKIE_NAME)?.value;
      console.log(`[Middleware] Path: ${pathname}, Token exists: ${!!token}`);

      // 토큰이 없거나 유효하지 않은 경우 로그인 페이지로 리다이렉트
      if (!token || !(await verifyToken(token))) {
        const loginUrl = new URL('/admin/login', request.url);
        // 로그인 후 원래 페이지로 돌아가기 위해 returnUrl 파라미터 추가
        // URL 인코딩 문제 수정: 원본 pathname을 한 번만 인코딩
        const encodedReturnUrl = encodeURIComponent(pathname);
        loginUrl.searchParams.set('returnUrl', encodedReturnUrl);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error('Middleware authentication error:', error);
      const loginUrl = new URL('/admin/login', request.url);
      // URL 인코딩 문제 수정: 원본 pathname을 한 번만 인코딩
      const encodedReturnUrl = encodeURIComponent(pathname);
      loginUrl.searchParams.set('returnUrl', encodedReturnUrl);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 로그인 페이지에서 이미 인증된 사용자가 접근하는 경우 대시보드로 리다이렉트
  if (pathname === '/admin/login') {
    try {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      
      if (token && (await verifyToken(token))) {
        // returnUrl이 있으면 해당 URL로, 없으면 대시보드로 리다이렉트
        const returnUrl = request.nextUrl.searchParams.get('returnUrl');
        const decodedReturnUrl = returnUrl ? decodeURIComponent(returnUrl) : null;
        const isValidReturnUrl = decodedReturnUrl && decodedReturnUrl.startsWith('/admin');
        const finalUrl = isValidReturnUrl ? decodedReturnUrl : '/admin';
        
        return NextResponse.redirect(new URL(finalUrl, request.url));
      }
    } catch (error) {
      console.error('Middleware redirect error:', error);
      // 오류 발생 시 로그인 페이지 유지
    }
  }

  return NextResponse.next();
}

/**
 * 미들웨어가 실행될 경로 설정
 * 분석을 위해 모든 페이지 포함, 정적 파일 제외
 */
export const config = {
  matcher: [
    /*
     * 모든 페이지에서 분석 수행
     * 정적 파일과 API는 제외
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 