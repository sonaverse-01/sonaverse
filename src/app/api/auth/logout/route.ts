import { NextRequest, NextResponse } from 'next/server';
import { removeAuthCookie } from '../../../../lib/auth-server';

/**
 * 로그아웃 API 엔드포인트
 * 쿠키를 삭제하고 로그인 페이지로 리다이렉트합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 응답 생성
    const response = NextResponse.json({ 
      success: true, 
      message: '로그아웃되었습니다.' 
    });
    
    // 쿠키 삭제
    const responseWithCookieRemoved = removeAuthCookie(response);
    
    return responseWithCookieRemoved;
  } catch (error) {
    console.error('[로그아웃 API] 오류:', error);
    return NextResponse.json(
      { success: false, error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET 요청으로도 로그아웃 처리 (브라우저에서 직접 접근 가능)
 */
export async function GET(request: NextRequest) {
  try {
    // 응답 생성 (리다이렉트)
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    
    // 쿠키 삭제
    const responseWithCookieRemoved = removeAuthCookie(response);
    
    return responseWithCookieRemoved;
  } catch (error) {
    console.error('[로그아웃 API] GET 요청 오류:', error);
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
} 