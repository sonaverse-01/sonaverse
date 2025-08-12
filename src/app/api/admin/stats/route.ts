import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth-server';
import { dbConnect } from '../../../../lib/db';
import SonaverseStory from '../../../../models/SonaverseStory';
import PressRelease from '../../../../models/PressRelease';
import Inquiry from '../../../../models/Inquiry';
import VisitorLog from '../../../../models/VisitorLog';

export async function GET(request: NextRequest) {
  try {
    // 인증 체크
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // 실제 데이터베이스에서 통계 가져오기
    const [
      totalPress,
      totalSonaverseStories,
      totalInquiries,
      totalVisitors,
      recentPressReleases,
      recentSonaverseStories
    ] = await Promise.all([
      PressRelease.countDocuments(),
      SonaverseStory.countDocuments(),
      Inquiry.countDocuments(),
      // 고유 방문자 수 계산 (세션 ID 기반)
      VisitorLog.aggregate([
        {
          $group: {
            _id: '$sessionId',
            count: { $sum: 1 }
          }
        },
        {
          $count: 'uniqueVisitors'
        }
      ]),
      PressRelease.find().sort({ created_at: -1 }).limit(3).select('content slug created_at'),
      SonaverseStory.find().sort({ created_at: -1 }).limit(3).select('content slug created_at')
    ]);

    // 오늘과 어제의 방문자 수 및 증감률 계산
    const now = new Date();
    const todayYesterdayStats = await calculateTodayYesterdayStats(now);

    // 최근 게시물 통합
    const recentPosts = [
      ...recentPressReleases.map(post => ({
        type: 'press',
        title: post.content?.ko?.title || post.content?.en?.title || '제목 없음',
        slug: post.slug,
        created_at: post.created_at
      })),
      ...recentSonaverseStories.map(post => ({
        type: 'sonaverse-story',
        title: post.content?.ko?.title || post.content?.en?.title || '제목 없음',
        slug: post.slug,
        created_at: post.created_at
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    return NextResponse.json({
      totalPress,
      totalSonaverseStories,
      totalInquiries,
      totalVisitors: totalVisitors[0]?.uniqueVisitors || 0,
      todayVisitors: todayYesterdayStats.today,
      yesterdayVisitors: todayYesterdayStats.yesterday,
      visitorChangePercent: todayYesterdayStats.changePercent,
      visitorChangeType: todayYesterdayStats.changeType,
      recentPosts
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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

 