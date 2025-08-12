import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../lib/auth-server';
import { dbConnect } from '../../../../../lib/db';
import AdminUser from '../../../../../models/AdminUser';

/**
 * DELETE - 관리자 사용자 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // admin@sonaverse.kr만 접근 가능
    if (user.email !== 'admin@sonaverse.kr') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
    }

    await dbConnect();

    // 삭제할 사용자 확인
    const userToDelete = await AdminUser.findById(id);
    if (!userToDelete) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // admin@sonaverse.kr 계정은 삭제 불가
    if (userToDelete.email === 'admin@sonaverse.kr') {
      return NextResponse.json({ 
        error: '최고 관리자 계정은 삭제할 수 없습니다.' 
      }, { status: 400 });
    }

    // 사용자 삭제
    await AdminUser.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: '관리자 계정이 성공적으로 삭제되었습니다.' 
    });

  } catch (error) {
    console.error('Delete admin user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}