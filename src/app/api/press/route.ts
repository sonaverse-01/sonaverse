import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import PressRelease from '../../../models/PressRelease';
import { getCurrentUser } from '../../../lib/auth-server';
import mongoose from 'mongoose';

/**
 * GET: 언론보도 목록 조회 (lang, page, search 파라미터로 다국어/페이지네이션/검색 지원)
 * POST: 새 언론보도 등록 (관리자 인증 필요)
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'ko';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search')?.trim();
    const active = searchParams.get('active');

    // 관리자 페이지용 쿼리 (active 파라미터가 있으면 해당 조건으로 필터링)
    let query: any = {};
    if (active !== null) {
      query = { is_active: active === 'true' };
    }
    
    // 검색 조건 추가 (제목/언론사명/본문)
    if (search) {
      query.$or = [
        { [`content.${lang}.title`]: { $regex: search, $options: 'i' } },
        { [`press_name.${lang}`]: { $regex: search, $options: 'i' } },
        { [`content.${lang}.body`]: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (page - 1) * pageSize;
    const total = await PressRelease.countDocuments(query);
    const totalPages = Math.ceil(total / pageSize);
    
    const pressReleases = await PressRelease.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(pageSize);
    
    // 관리자 페이지용 응답 구조
    const result = pressReleases.map((item: any) => ({
      _id: item._id,
      slug: item.slug,
      press_name: item.press_name,
      content: item.content,
      is_active: item.is_active,
      created_at: item.created_at,
      last_updated: item.updated_at || item.created_at,
    }));
    
    return NextResponse.json({
      total,
      page,
      pageSize,
      totalPages,
      results: result,
    });
  } catch (error) {
    console.error('Error fetching press releases:', error);
    return NextResponse.json({ error: '언론보도 목록을 가져오는데 실패했습니다.' }, { status: 500 });
  }
}

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
    if (!body.slug || !body.press_name || !body.content) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    // slug 중복 확인
    const existingPress = await PressRelease.findOne({ slug: body.slug });
    if (existingPress) {
      return NextResponse.json({ error: '이미 존재하는 슬러그입니다.' }, { status: 400 });
    }

    const newPress = await PressRelease.create({
      slug: body.slug,
      press_name: body.press_name,
      external_link: body.external_link,
      content: body.content,
      tags: body.tags || [],
      created_at: body.created_at ? new Date(body.created_at) : new Date(),
      updated_by: user.id,
      is_active: body.is_active !== false,
    });

    return NextResponse.json({ success: true, press: newPress });
  } catch (error) {
    console.error('Error creating press release:', error);
    
    // MongoDB 중복 키 오류 처리
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({ error: '이미 존재하는 슬러그입니다.' }, { status: 400 });
    }
    
    return NextResponse.json({ error: '언론보도 등록에 실패했습니다.' }, { status: 500 });
  }
} 