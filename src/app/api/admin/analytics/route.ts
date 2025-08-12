import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth-server';
import { dbConnect } from '../../../../lib/db';
import SonaverseStory from '../../../../models/SonaverseStory';
import PressRelease from '../../../../models/PressRelease';
import VisitorLog from '../../../../models/VisitorLog';
import ReferralKeyword from '../../../../models/ReferralKeyword';
import { getSearchEngineDisplayName } from '../../../../lib/referral-parser';

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const visitorPeriod = searchParams.get('visitorPeriod') || 'daily';
    const keywordPeriod = searchParams.get('keywordPeriod') || 'daily';
    const contentPeriod = searchParams.get('contentPeriod') || 'daily';

    await dbConnect();

    // 기간별 방문자 통계 계산
    const now = new Date();
    const visitors = await calculateVisitorStats(visitorPeriod, now);
    
    // 오늘과 어제의 방문자 수 및 증감률 계산
    const todayYesterdayStats = await calculateTodayYesterdayStats(now);
    
    // 전체 기간의 고유 방문자 수 계산
    const totalUniqueVisitors = await VisitorLog.aggregate([
      {
        $group: {
          _id: '$sessionId'
        }
      },
      {
        $count: 'uniqueVisitors'
      }
    ]);
    
    // 기간별 외부 유입 키워드 통계
    const referralKeywords = await calculateReferralKeywords(keywordPeriod, now);
    
    // 기간별 콘텐츠 통계
    const content = await calculateContentStats(contentPeriod, now);

    // 디버깅: 전체 데이터 개수 확인
    const [totalPress, totalSonaverseStories] = await Promise.all([
      PressRelease.countDocuments(),
      SonaverseStory.countDocuments()
    ]);

    return NextResponse.json({
      visitors: {
        ...visitors,
        totalUnique: totalUniqueVisitors[0]?.uniqueVisitors || 0,
        today: todayYesterdayStats.today,
        yesterday: todayYesterdayStats.yesterday,
        changePercent: todayYesterdayStats.changePercent,
        changeType: todayYesterdayStats.changeType
      },
      referralKeywords, // 외부 유입 키워드
      content,
      totals: {
        press: totalPress,
        sonaverseStories: totalSonaverseStories
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 방문자 통계 계산
async function calculateVisitorStats(period: string, now: Date) {
  const trend = [];
  
  if (period === 'daily') {
    // 일간: 최근 7일
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // 고유 방문자 수 계산 (세션 ID 기반)
      const uniqueVisitors = await VisitorLog.aggregate([
        {
          $match: {
            timestamp: { $gte: startOfDay, $lte: endOfDay }
          }
        },
        {
          $group: {
            _id: '$sessionId'
          }
        },
        {
          $count: 'uniqueVisitors'
        }
      ]);
      
      const count = uniqueVisitors[0]?.uniqueVisitors || 0;
      
      const displayDate = `${date.getMonth() + 1}월 ${date.getDate()}일`;
      trend.push({ date: displayDate, count });
    }
  } else if (period === 'weekly') {
    // 주간: 최근 4주
    for (let i = 3; i >= 0; i--) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - (i * 7));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      // 고유 방문자 수 계산 (세션 ID 기반)
      const uniqueVisitors = await VisitorLog.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$sessionId'
          }
        },
        {
          $count: 'uniqueVisitors'
        }
      ]);
      
      const count = uniqueVisitors[0]?.uniqueVisitors || 0;
      
      const weekNumber = Math.ceil((startDate.getDate() + startDate.getDay()) / 7);
      const displayDate = `${startDate.getMonth() + 1}월 ${weekNumber}째 주`;
      trend.push({ date: displayDate, count });
    }
  } else {
    // 월간: 최근 6개월
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      
      // 고유 방문자 수 계산 (세션 ID 기반)
      const uniqueVisitors = await VisitorLog.aggregate([
        {
          $match: {
            timestamp: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: '$sessionId'
          }
        },
        {
          $count: 'uniqueVisitors'
        }
      ]);
      
      const count = uniqueVisitors[0]?.uniqueVisitors || 0;
      
      const displayDate = `${month + 1}월`;
      trend.push({ date: displayDate, count });
    }
  }
  
  return {
    trend
  };
}

// 외부 유입 키워드 통계 계산
async function calculateReferralKeywords(period: string, now: Date) {
  let cutoffDate: Date;
  
  if (period === 'daily') {
    // 일간: 오늘 하루
    cutoffDate = new Date(now);
    cutoffDate.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    // 주간: 최근 7일
    cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - 7);
  } else {
    // 월간: 최근 30일
    cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - 30);
  }
  
  const keywords = await ReferralKeyword.find({
    lastUsed: { $gte: cutoffDate }
  }).sort({ count: -1 }).limit(10);
  
  return keywords.map(keyword => ({
    keyword: keyword.keyword,
    count: keyword.count,
    searchEngine: keyword.searchEngine,
    searchEngineDisplay: getSearchEngineDisplayName(keyword.searchEngine)
  }));
}

// 콘텐츠 통계 계산
async function calculateContentStats(period: string, now: Date) {
  const pressTrend = [];
  const sonaverseStoryTrend = [];
  
  if (period === 'daily') {
    // 일간: 최근 7일
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const [pressCount, sonaverseStoryCount] = await Promise.all([
        PressRelease.countDocuments({
          created_at: { $gte: startOfDay, $lte: endOfDay },
          is_active: true
        }),
        SonaverseStory.countDocuments({
          created_at: { $gte: startOfDay, $lte: endOfDay },
          is_published: true
        })
      ]);
      
      const displayDate = `${date.getMonth() + 1}월 ${date.getDate()}일`;
      pressTrend.push({ date: displayDate, count: pressCount });
      sonaverseStoryTrend.push({ date: displayDate, count: sonaverseStoryCount });
    }
  } else if (period === 'weekly') {
    // 주간: 최근 4주
    for (let i = 3; i >= 0; i--) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - (i * 7));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      const [pressCount, sonaverseStoryCount] = await Promise.all([
        PressRelease.countDocuments({
          created_at: { $gte: startDate, $lte: endDate },
          is_active: true
        }),
        SonaverseStory.countDocuments({
          created_at: { $gte: startDate, $lte: endDate },
          is_published: true
        })
      ]);
      
      const weekNumber = Math.ceil((startDate.getDate() + startDate.getDay()) / 7);
      const displayDate = `${startDate.getMonth() + 1}월 ${weekNumber}째 주`;
      pressTrend.push({ date: displayDate, count: pressCount });
      sonaverseStoryTrend.push({ date: displayDate, count: sonaverseStoryCount });
    }
  } else {
    // 월간: 최근 6개월
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      
      const [pressCount, sonaverseStoryCount] = await Promise.all([
        PressRelease.countDocuments({
          created_at: { $gte: startOfMonth, $lte: endOfMonth },
          is_active: true
        }),
        SonaverseStory.countDocuments({
          created_at: { $gte: startOfMonth, $lte: endOfMonth },
          is_published: true
        })
      ]);
      
      const displayDate = `${month + 1}월`;
      pressTrend.push({ date: displayDate, count: pressCount });
      sonaverseStoryTrend.push({ date: displayDate, count: sonaverseStoryCount });
    }
  }
  
  return {
    press: pressTrend,
    sonaverseStory: sonaverseStoryTrend
  };
}

// 오늘과 어제의 방문자 수 및 증감률 계산
async function calculateTodayYesterdayStats(now: Date) {
  // 오늘 (0시부터 현재까지)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  
  // 어제 (어제 0시부터 23시 59분까지)
  const yesterdayStart = new Date(now);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(now);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);
  
  // 오늘의 고유 방문자 수
  const todayVisitors = await VisitorLog.aggregate([
    {
      $match: {
        timestamp: { $gte: todayStart, $lte: todayEnd }
      }
    },
    {
      $group: {
        _id: '$sessionId'
      }
    },
    {
      $count: 'uniqueVisitors'
    }
  ]);
  
  // 어제의 고유 방문자 수
  const yesterdayVisitors = await VisitorLog.aggregate([
    {
      $match: {
        timestamp: { $gte: yesterdayStart, $lte: yesterdayEnd }
      }
    },
    {
      $group: {
        _id: '$sessionId'
      }
    },
    {
      $count: 'uniqueVisitors'
    }
  ]);
  
  const todayCount = todayVisitors[0]?.uniqueVisitors || 0;
  const yesterdayCount = yesterdayVisitors[0]?.uniqueVisitors || 0;
  
  // 증감률 계산
  let changePercent = 0;
  let changeType: 'increase' | 'decrease' | 'same' = 'same';
  
  if (yesterdayCount === 0) {
    if (todayCount > 0) {
      changePercent = 100;
      changeType = 'increase';
    }
  } else {
    const change = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
    changePercent = Math.round(Math.abs(change)); // 소수점 제거
    
    if (change > 0) {
      changeType = 'increase';
    } else if (change < 0) {
      changeType = 'decrease';
    }
  }
  
  return {
    today: todayCount,
    yesterday: yesterdayCount,
    changePercent,
    changeType
  };
} 