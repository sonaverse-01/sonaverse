import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/db';
import Inquiry from '../../../models/Inquiry';
import { sendInquiryNotification } from '../../../lib/email';

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
    const requiredFields = ['inquiry_type', 'name', 'phone_number', 'email', 'message'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `필수 필드가 누락되었습니다: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // 문의 데이터 생성
    const inquiryData = {
      ...body,
      submitted_at: new Date(),
      status: 'pending'
    };
    
    const inquiry = new Inquiry(inquiryData);
    await inquiry.save();
    
    // 이메일 알림 전송 (저장된 inquiry 객체 사용)
    // 이메일 전송 실패해도 문의는 성공적으로 저장됨
    sendInquiryNotification(inquiry.toObject()).then(success => {
      if (success) {
        console.log('문의 알림 이메일 전송 성공');
      } else {
        console.error('문의 알림 이메일 전송 실패 - 문의는 저장됨');
      }
    }).catch(error => {
      console.error('문의 알림 이메일 전송 중 오류 발생:', error);
    });
    
    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: '문의 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 