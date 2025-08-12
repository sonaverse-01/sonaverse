import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DiaperProduct from '@/models/DiaperProduct';
import { getCurrentUser } from '@/lib/auth-server';

// GET - 제품 목록 조회
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    
    const skip = (page - 1) * limit;
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { 'name.ko': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'description.ko': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    const products = await DiaperProduct.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await DiaperProduct.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching diaper products:', error);
    return NextResponse.json({
      success: false,
      error: '제품 목록을 불러오는데 실패했습니다.'
    }, { status: 500 });
  }
}

// POST - 새 제품 생성
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // slug 중복 확인
    const existingProduct = await DiaperProduct.findOne({ slug: body.slug });
    if (existingProduct) {
      return NextResponse.json({
        success: false,
        error: '이미 존재하는 슬러그입니다.'
      }, { status: 400 });
    }
    
    const product = new DiaperProduct(body);
    await product.save();
    
    return NextResponse.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error creating diaper product:', error);
    return NextResponse.json({
      success: false,
      error: '제품 생성에 실패했습니다.'
    }, { status: 500 });
  }
} 