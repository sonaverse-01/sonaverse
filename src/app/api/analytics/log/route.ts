import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import VisitorLog from '../../../../models/VisitorLog';
import ReferralKeyword from '../../../../models/ReferralKeyword';
import { extractSearchKeyword, isValidKeyword } from '../../../../lib/referral-parser';

export async function POST(request: NextRequest) {
  try {
    // 개발 환경에서는 방문자 로그를 기록하지 않음
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ success: true, message: 'Skipped in development' });
    }

    // 데이터베이스 연결 시도
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ success: false, message: 'Database unavailable' }, { status: 503 });
    }
    
    const body = await request.json();
    const { page, referrer, userAgent, ip, sessionId, today } = body;

    // 필수 필드 검증
    if (!page || !sessionId) {
      return NextResponse.json({ error: 'Page and sessionId are required' }, { status: 400 });
    }

    // 오늘 날짜의 시작과 끝
    const todayStart = new Date(today);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // 같은 세션에서 오늘 이미 방문 기록이 있는지 확인
    const existingVisit = await VisitorLog.findOne({
      sessionId,
      timestamp: {
        $gte: todayStart,
        $lt: todayEnd
      }
    });

    // 이미 오늘 방문 기록이 있으면 추가 로그를 생성하지 않음
    if (existingVisit) {
      return NextResponse.json({ success: true, message: 'Already visited today' });
    }

    // 방문자 로그 저장 (오늘 처음 방문한 경우만)
    const visitorLog = new VisitorLog({
      page,
      timestamp: new Date(),
      referrer,
      userAgent,
      ip,
      sessionId
    });

    await visitorLog.save();

    // referrer가 있는 경우 외부 유입 키워드 처리 (비동기)
    if (referrer) {
      processReferralKeyword(referrer).catch(error => {
        console.error('Error processing referral keyword:', error);
      });
    }

    return NextResponse.json({ success: true, message: 'New visit logged' });

  } catch (error) {
    console.error('Error logging visitor:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// 외부 유입 키워드 처리 함수
async function processReferralKeyword(referrerUrl: string) {
  try {
    const referralData = extractSearchKeyword(referrerUrl);
    
    if (!referralData || !isValidKeyword(referralData.keyword)) {
      return; // 검색엔진이 아니거나 유효하지 않은 키워드
    }

    const { keyword, searchEngine } = referralData;

    // 기존 키워드 확인
    const existingKeyword = await ReferralKeyword.findOne({ 
      keyword, 
      searchEngine 
    });

    if (existingKeyword) {
      // 기존 키워드의 카운트 증가
      existingKeyword.count += 1;
      existingKeyword.lastUsed = new Date();
      await existingKeyword.save();
    } else {
      // 새로운 키워드 생성
      const newKeyword = new ReferralKeyword({
        keyword,
        searchEngine,
        referrerUrl: referrerUrl,
        count: 1,
        lastUsed: new Date()
      });
      await newKeyword.save();
    }

    console.log(`Referral keyword logged: "${keyword}" from ${searchEngine}`);
  } catch (error) {
    console.error('Error processing referral keyword:', error);
  }
} 