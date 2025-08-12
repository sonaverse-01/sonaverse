import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import Inquiry from '../../../models/Inquiry';

/**
 * 문의 목록 조회 및 새 문의 생성 API
 */
export async function GET() {
  try {
    await dbConnect();
    const inquiries = await Inquiry.find({}).sort({ submitted_at: -1 });
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: '문의 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // 필수 필드 검증
    const requiredFields = ['inquiry_type', 'name', 'company_name', 'phone_number', 'email', 'message'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `필수 필드가 누락되었습니다: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const inquiry = new Inquiry(body);
    await inquiry.save();
    
    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: '문의 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 