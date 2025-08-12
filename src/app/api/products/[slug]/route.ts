import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import Product from '../../../../models/Product';

/**
 * 개별 제품 조회, 수정, 삭제 API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const product = await Product.findOne({ slug: resolvedParams.slug });
    
    if (!product) {
      return NextResponse.json(
        { error: '제품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: '제품을 가져오는데 실패했습니다.' },
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
    
    const product = await Product.findOneAndUpdate(
      { slug: resolvedParams.slug },
      { ...body, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { error: '제품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: '제품 수정에 실패했습니다.' },
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
    const product = await Product.findOneAndDelete({ slug: resolvedParams.slug });
    
    if (!product) {
      return NextResponse.json(
        { error: '제품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: '제품이 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: '제품 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 