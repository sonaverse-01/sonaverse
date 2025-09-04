import { NextRequest, NextResponse } from 'next/server';

export function analyticsMiddleware(request: NextRequest) {
  // 어드민 페이지는 제외
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return;
  }

  // API 요청은 제외
  if (request.nextUrl.pathname.startsWith('/api')) {
    return;
  }

  // 정적 파일은 제외
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/favicon') ||
      request.nextUrl.pathname.includes('.')) {
    return;
  }

  // 방문자 로그를 DB에 저장 (비동기로 처리, 에러 무시)
  logVisitorToDB(request).catch(error => {
    // 에러를 로그에 기록하지만 애플리케이션에 영향을 주지 않음
    console.error('Error logging visitor to DB (non-critical):', error);
  });
}

// 방문자 로그를 DB에 저장하는 함수
async function logVisitorToDB(request: NextRequest) {
  try {
    // 프로덕션 환경에서만 로그 기록
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const page = request.nextUrl.pathname;
    const referrer = request.headers.get('referer') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // 세션 ID 생성 (간단한 구현)
    const sessionId = generateSessionId(request);

    // 오늘 날짜의 시작과 끝
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logData = {
      page,
      referrer,
      userAgent,
      ip,
      sessionId,
      today: today.toISOString()
    };

    // DB에 로그 저장 (세션 기반 중복 체크)
    // 내부 API 호출이므로 인증 없이 직접 처리
    const response = await fetch(`${request.nextUrl.origin}/api/analytics/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 내부 API 호출임을 나타내는 헤더 추가
        'X-Internal-Call': 'true'
      },
      body: JSON.stringify(logData)
    });

    if (!response.ok) {
      // 401 에러가 아닌 경우에만 에러 로그 기록
      if (response.status !== 401) {
        throw new Error(`Failed to log visitor data: ${response.status}`);
      }
      // 401 에러는 조용히 무시 (데이터베이스 연결 문제일 수 있음)
      console.log('Analytics logging skipped due to auth issue (non-critical)');
    }

  } catch (error) {
    // 에러를 던지지 않고 로그만 기록 (비중요한 기능이므로)
    console.log('Analytics logging error (non-critical):', error instanceof Error ? error.message : String(error));
  }
}

// 간단한 세션 ID 생성 함수
function generateSessionId(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // 간단한 해시 생성
  let hash = 0;
  const str = userAgent + ip;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  
  return Math.abs(hash).toString(36);
} 