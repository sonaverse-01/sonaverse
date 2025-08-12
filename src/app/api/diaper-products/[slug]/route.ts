import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DiaperProduct from '@/models/DiaperProduct';

// GET - 특정 제품 조회 (활성화된 제품만)
export async function GET(request: NextRequest, context: any) {
  const { slug } = await context.params;
  try {
    await dbConnect();
    const product = await DiaperProduct.findOne({ 
      slug,
      is_active: true 
    });
    if (!product) {
      return NextResponse.json({
        success: false,
        error: '제품을 찾을 수 없습니다.'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching diaper product:', error);
    return NextResponse.json({
      success: false,
      error: '제품을 불러오는데 실패했습니다.'
    }, { status: 500 });
  }
} 