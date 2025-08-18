import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import PressRelease from '../../../../models/PressRelease';
import { verifyToken, getCurrentUser } from '../../../../lib/auth-server';

/**
 * GET: 특정 언론보도 상세 정보 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'ko';
    const isAdmin = searchParams.get('admin') === 'true';
    
    const resolvedParams = await params;
    
    // 관리자 요청인지 확인 (쿠키에서 토큰 확인)
    let query: any = { slug: resolvedParams.slug };
    
    // 관리자가 아닌 경우에만 활성화된 것만 조회
    if (!isAdmin) {
      query.is_active = true;
    }
    
    const pressRelease = await PressRelease.findOne(query);
    
    if (!pressRelease) {
      return NextResponse.json(
        { error: '해당 언론보도를 찾을 수 없습니다.' }, 
        { status: 404 }
      );
    }
    
    // 관리자 요청인 경우 전체 데이터 반환 (수정 페이지용)
    if (isAdmin) {
      const result = {
        slug: pressRelease.slug,
        press_name: pressRelease.press_name,
        thumbnail: pressRelease.thumbnail,
        external_link: pressRelease.external_link,
        content: pressRelease.content,
        created_at: pressRelease.created_at?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        is_active: pressRelease.is_active,
        tags: pressRelease.tags || { ko: [], en: [] },
      };
      return NextResponse.json(result);
    }
    
    // 일반 사용자 요청인 경우 언어별 데이터만 추출
    const result = {
      slug: pressRelease.slug,
      created_at: pressRelease.created_at,
      press_name: pressRelease.press_name[lang] || pressRelease.press_name['ko'],
      title: pressRelease.content[lang]?.title || pressRelease.content['ko']?.title,
      body: pressRelease.content[lang]?.body || pressRelease.content['ko']?.body,
      external_link: pressRelease.content[lang]?.external_link || pressRelease.content['ko']?.external_link,
      is_active: pressRelease.is_active,
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching press release:', error);
    return NextResponse.json(
      { error: '언론보도 상세 정보를 가져오는데 실패했습니다.' }, 
      { status: 500 }
    );
  }
}

/**
 * PATCH: 언론보도 수정 (활성화/비활성화 상태 변경)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 쿠키 기반 인증 체크
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const body = await request.json();
    
    const updateData: any = {};
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.created_at) updateData.created_at = new Date(body.created_at);
    if (body.press_name) updateData.press_name = body.press_name;
    if (body.external_link !== undefined) updateData.external_link = body.external_link;
    if (body.content) updateData.content = body.content;
    if (body.tags) updateData.tags = body.tags;
    // 썸네일 처리: content에서 추출하거나 직접 설정
    if (body.content?.ko?.thumbnail_url || body.content?.en?.thumbnail_url) {
      updateData.thumbnail = body.content?.ko?.thumbnail_url || body.content?.en?.thumbnail_url;
    }
    updateData.last_updated = new Date();
    
    const pressRelease = await PressRelease.findOneAndUpdate(
      { slug: resolvedParams.slug },
      updateData,
      { new: true }
    );
    
    if (!pressRelease) {
      return NextResponse.json(
        { error: '해당 언론보도를 찾을 수 없습니다.' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, press: pressRelease });
  } catch (error) {
    console.error('Error updating press release:', error);
    return NextResponse.json(
      { error: '언론보도 수정에 실패했습니다.' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE: 언론보도 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 쿠키 기반 인증 체크
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    
    const pressRelease = await PressRelease.findOneAndDelete({ slug: resolvedParams.slug });
    
    if (!pressRelease) {
      return NextResponse.json(
        { error: '해당 언론보도를 찾을 수 없습니다.' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting press release:', error);
    return NextResponse.json(
      { error: '언론보도 삭제에 실패했습니다.' }, 
      { status: 500 }
    );
  }
} 