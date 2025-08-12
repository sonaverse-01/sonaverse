import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import Page from '../../../models/Page';

/**
 * 페이지 목록 조회 및 새 페이지 생성 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page') || '1';
    const search = searchParams.get('search');

    await dbConnect();

    // 쿼리 조건 구성
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (published === 'true') {
      query.is_published = true;
    }
    
    if (search) {
      query.$or = [
        { 'content.ko.title': { $regex: search, $options: 'i' } },
        { 'content.en.title': { $regex: search, $options: 'i' } },
        { 'content.ko.subtitle': { $regex: search, $options: 'i' } },
        { 'content.en.subtitle': { $regex: search, $options: 'i' } },
        { 'content.ko.body': { $regex: search, $options: 'i' } },
        { 'content.en.body': { $regex: search, $options: 'i' } }
      ];
    }

    // 페이지네이션 설정
    const pageNum = parseInt(page);
    const limitNum = limit ? parseInt(limit) : 10;
    const skip = (pageNum - 1) * limitNum;

    // 전체 개수 조회
    const total = await Page.countDocuments(query);
    
    // 데이터 조회
    const pages = await Page.find(query)
      .sort({ updated_at: -1 })
      .skip(skip)
      .limit(limitNum);

    return NextResponse.json({
      success: true,
      results: pages,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { success: false, error: '페이지 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const page = new Page(body);
    await page.save();
    
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: '페이지 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 