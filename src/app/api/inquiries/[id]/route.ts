import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth-server';
import Inquiry from '../../../../models/Inquiry';

/**
 * 개별 문의 조회, 수정, 삭제 API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const inquiry = await Inquiry.findById(resolvedParams.id)
      .populate('responded_by', 'username email')
      .populate('status_history.changed_by', 'username email');
    
    if (!inquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    return NextResponse.json(
      { error: '문의를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // 현재 사용자 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const resolvedParams = await params;
    const body = await request.json();
    
    // 기존 문의 조회
    const existingInquiry = await Inquiry.findById(resolvedParams.id);
    if (!existingInquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const updateData: any = { ...body };
    
    // 상태가 변경된 경우 히스토리 추가
    if (body.status && body.status !== existingInquiry.status) {
      updateData.status_history = [
        ...existingInquiry.status_history,
        {
          status: body.status,
          changed_by: user.id,
          changed_at: new Date(),
          notes: body.status_change_notes || ''
        }
      ];
      
      // 상태에 따른 추가 정보 설정
      if (body.status === 'completed') {
        updateData.responded_at = new Date();
        updateData.responded_by = user.id;
      }
    }
    
    const inquiry = await Inquiry.findByIdAndUpdate(
      resolvedParams.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('responded_by', 'username email')
     .populate('status_history.changed_by', 'username email');
    
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { error: '문의 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // 현재 사용자 확인 (관리자만 삭제 가능)
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const resolvedParams = await params;
    const inquiry = await Inquiry.findByIdAndDelete(resolvedParams.id);
    
    if (!inquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    console.log(`문의 삭제됨: ID ${resolvedParams.id}, 삭제자: ${user.username}`);
    
    return NextResponse.json({ message: '문의가 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json(
      { error: '문의 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 