import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DiaperProduct from '@/models/DiaperProduct';
import { getCurrentUser } from '@/lib/auth-server';

// GET - 특정 제품 조회
export async function GET(request: NextRequest, context: any) {
  const { slug } = context.params;
  try {
    await dbConnect();
    const product = await DiaperProduct.findOne({ slug });
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

// PUT - 제품 수정
export async function PUT(request: NextRequest, context: any) {
  const { slug } = context.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
    }
    await dbConnect();
    const body = await request.json();
    // slug 변경 시 중복 확인
    if (body.slug && body.slug !== slug) {
      const existingProduct = await DiaperProduct.findOne({ slug: body.slug });
      if (existingProduct) {
        return NextResponse.json({
          success: false,
          error: '이미 존재하는 슬러그입니다.'
        }, { status: 400 });
      }
    }
    const product = await DiaperProduct.findOneAndUpdate(
      { slug },
      body,
      { new: true, runValidators: true }
    );
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
    console.error('Error updating diaper product:', error);
    return NextResponse.json({
      success: false,
      error: '제품 수정에 실패했습니다.'
    }, { status: 500 });
  }
}

// DELETE - 제품 삭제
export async function DELETE(request: NextRequest, context: any) {
  const { slug } = context.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
    }
    await dbConnect();
    const product = await DiaperProduct.findOneAndDelete({ slug });
    if (!product) {
      return NextResponse.json({
        success: false,
        error: '제품을 찾을 수 없습니다.'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: '제품이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Error deleting diaper product:', error);
    return NextResponse.json({
      success: false,
      error: '제품 삭제에 실패했습니다.'
    }, { status: 500 });
  }
} 