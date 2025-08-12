import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import Product from '../../../models/Product';

/**
 * 제품 목록 조회 및 새 제품 생성 API
 */
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ updated_at: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: '제품 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const product = new Product(body);
    await product.save();
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: '제품 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 