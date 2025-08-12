import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DiaperProduct from '@/models/DiaperProduct';

// GET - 활성화된 제품 목록 조회
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const lang = searchParams.get('lang') || 'ko';
    
    let query: any = { is_active: true };
    
    if (category) {
      query.category = category;
    }
    
    const products = await DiaperProduct.find(query)
      .sort({ created_at: -1 });
    
    return NextResponse.json({
      success: true,
      products,
      total: products.length
    });
  } catch (error) {
    console.error('Error fetching diaper products:', error);
    return NextResponse.json({
      success: false,
      error: '제품 목록을 불러오는데 실패했습니다.'
    }, { status: 500 });
  }
} 