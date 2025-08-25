import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import SonaverseStory from '../../../../models/SonaverseStory';
import { verifyToken, getTokenFromCookie } from '../../../../lib/auth-server';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * 소나버스 스토리 상세 조회 (GET)
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const query: { slug: string; is_published?: boolean } = { slug };
    if (!isAdmin) {
      query.is_published = true;
    }
    
    const sonaverseStory = await SonaverseStory.findOne(query).lean();
    
    if (!sonaverseStory) {
      return NextResponse.json(
        { error: '소나버스 스토리를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // For admin, return the full object.
    if (isAdmin) {
      return NextResponse.json(sonaverseStory);
    }

    // For non-admin, return a subset of fields.
    const story = sonaverseStory as any;
    const result = {
      _id: story._id,
      slug: story.slug,
      created_at: story.created_at,
      updated_at: story.updated_at,
      thumbnail_url: story.thumbnail_url,
      thumbnail: story.thumbnail_url || '',
      youtube_url: story.youtube_url || '',
      category: story.category || '',
      tags: story.tags || [],
      is_published: story.is_published,
      is_main: story.is_main,
      content: story.content || {}
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching sonaverse story:', error);
    return NextResponse.json(
      { error: '소나버스 스토리를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 소나버스 스토리 수정 (PUT)
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    // 인증 체크 - Authorization 헤더 또는 쿠키에서 토큰 확인
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.replace('Bearer ', '');
    const cookieToken = await getTokenFromCookie();
    const token = headerToken || cookieToken;
    
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { slug } = await params;
    await dbConnect();
    const body = await request.json();
    
    // 기존 소나버스 스토리 확인
    const existingStory = await SonaverseStory.findOne({ slug });
    if (!existingStory) {
      return NextResponse.json(
        { error: '소나버스 스토리를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 메인 게시물로 설정할 경우, 기존 메인 게시물 해제
    if (body.is_main && !existingStory.is_main) {
      await SonaverseStory.updateMany(
        { is_main: true, slug: { $ne: slug } },
        { $set: { is_main: false } }
      );
    }
    
    // 소나버스 스토리 업데이트
    const updatedStory = await SonaverseStory.findOneAndUpdate(
      { slug },
      { 
        ...body, 
        last_updated: new Date() 
      },
      { new: true }
    );
    
    return NextResponse.json({
      message: '소나버스 스토리가 성공적으로 수정되었습니다.',
      data: updatedStory
    });
  } catch (error) {
    console.error('Error updating sonaverse story:', error);
    return NextResponse.json(
      { error: '소나버스 스토리 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 소나버스 스토리 삭제 (DELETE)
 */
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    // 인증 체크 - Authorization 헤더 또는 쿠키에서 토큰 확인
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.replace('Bearer ', '');
    const cookieToken = await getTokenFromCookie();
    const token = headerToken || cookieToken;
    
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { slug } = await params;
    await dbConnect();
    
    const deletedStory = await SonaverseStory.findOneAndDelete({ slug });
    
    if (!deletedStory) {
      return NextResponse.json(
        { error: '소나버스 스토리를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: '소나버스 스토리가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Error deleting sonaverse story:', error);
    return NextResponse.json(
      { error: '소나버스 스토리 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}