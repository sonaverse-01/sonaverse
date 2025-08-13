import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import SonaverseStory from '../../../models/SonaverseStory';
import { verifyToken, getCurrentUser } from '../../../lib/auth-server';

/**
 * 소나버스 스토리 목록 조회 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const published = searchParams.get('published') || 'true';
    
    const skip = (page - 1) * limit;
    
    // 검색 조건 구성
    const query: any = {};
    
    // 공개 여부 필터
    if (published === 'true') {
      query.is_published = true;
    }
    
    // 검색어 필터
    if (search) {
      query.$or = [
        { 'content.ko.title': { $regex: search, $options: 'i' } },
        { 'content.en.title': { $regex: search, $options: 'i' } },
        { 'content.ko.subtitle': { $regex: search, $options: 'i' } },
        { 'content.en.subtitle': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 태그 필터
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // 소나버스 스토리 조회
    const sonaverseStories = await SonaverseStory.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // 전체 개수 조회
    const total = await SonaverseStory.countDocuments(query);
    
    return NextResponse.json({
      results: sonaverseStories,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching sonaverse stories:', error);
    return NextResponse.json(
      { error: '소나버스 스토리를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 소나버스 스토리 생성 (POST)
 */
export async function POST(request: NextRequest) {
  try {
    // 쿠키 기반 인증 체크
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    // 필수 필드 검증
    if (!body.slug || !body.content) {
      return NextResponse.json(
        { error: '필수 필드를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 중복 slug 확인
    const existingPost = await SonaverseStory.findOne({ slug: body.slug });
    if (existingPost) {
      return NextResponse.json(
        { error: '이미 존재하는 슬러그입니다.' },
        { status: 400 }
      );
    }
    
    // 메인 게시물로 설정할 경우, 기존 메인 게시물 해제
    if (body.is_main) {
      await SonaverseStory.updateMany(
        { is_main: true },
        { $set: { is_main: false } }
      );
    }
    
    // 소나버스 스토리 생성
    const sonaverseStory = new SonaverseStory({
      ...body,
      author: user.id,
      updated_by: user.id,
      created_at: body.created_at ? new Date(body.created_at) : new Date(),
      last_updated: new Date()
    });
    
    await sonaverseStory.save();
    
    return NextResponse.json({
      success: true,
      sonaverseStory
    });
  } catch (error) {
    console.error('Error creating sonaverse story:', error);
    return NextResponse.json(
      { error: '소나버스 스토리 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 