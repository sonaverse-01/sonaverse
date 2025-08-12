import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth-server';

/**
 * 현재 인증된 사용자 정보 조회 API
 * 보안을 위해 민감한 정보는 제외합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 사용자입니다.' }, 
        { status: 401 }
      );
    }

    // 민감한 정보 제외하고 필요한 정보만 반환
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    return NextResponse.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, error: '인증 확인 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 