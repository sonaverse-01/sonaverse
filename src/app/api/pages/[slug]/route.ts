import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import Page from '../../../../models/Page';

/**
 * 개별 페이지 조회, 수정, 삭제 API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const page = await Page.findOne({ slug: resolvedParams.slug });
    
    if (!page) {
      return NextResponse.json(
        { error: '페이지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: '페이지를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const body = await request.json();
    
    const page = await Page.findOneAndUpdate(
      { slug: resolvedParams.slug },
      { ...body, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!page) {
      return NextResponse.json(
        { error: '페이지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: '페이지 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const page = await Page.findOneAndDelete({ slug: resolvedParams.slug });
    
    if (!page) {
      return NextResponse.json(
        { error: '페이지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: '페이지가 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: '페이지 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 