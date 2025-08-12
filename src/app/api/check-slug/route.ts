import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import SonaverseStory from '@/models/SonaverseStory';
import PressRelease from '@/models/PressRelease';
import DiaperProduct from '@/models/DiaperProduct';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: '슬러그가 필요합니다.' },
        { status: 400 }
      );
    }

    // 모든 컬렉션에서 slug 확인
    const [pressRelease, sonaverseStory, diaperProduct] = await Promise.all([
      PressRelease.findOne({ slug }),
      SonaverseStory.findOne({ slug }),
      DiaperProduct.findOne({ slug })
    ]);

    const results = {
      press: pressRelease ? { exists: true, title: pressRelease.content?.ko?.title || pressRelease.content?.en?.title || '제목 없음' } : { exists: false },
      sonaverseStory: sonaverseStory ? { exists: true, title: sonaverseStory.content?.ko?.title || sonaverseStory.content?.en?.title || '제목 없음' } : { exists: false },
      product: diaperProduct ? { exists: true, title: diaperProduct.name?.ko || diaperProduct.name?.en || '제품명 없음' } : { exists: false }
    };

    const hasConflict = results.press.exists || results.sonaverseStory.exists || results.product.exists;

    return NextResponse.json({
      slug,
      hasConflict,
      results
    });

  } catch (error) {
    console.error('Slug check error:', error);
    return NextResponse.json(
      { error: '슬러그 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 