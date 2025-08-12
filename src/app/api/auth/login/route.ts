import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/db';
import AdminUser from '../../../../models/AdminUser';
import { comparePassword, generateToken, setAuthCookie } from '../../../../lib/auth-server';
import { User } from '../../../../lib/constants';

/**
 * 로그인 API
 * 보안을 위해 엄격한 검증을 수행합니다.
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '잘못된 요청 형식입니다.' }, 
        { status: 400 }
      );
    }

    const { email, password } = body;

    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '이메일과 비밀번호를 입력해주세요.' }, 
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '올바른 이메일 형식을 입력해주세요.' }, 
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: '비밀번호는 최소 8자 이상이어야 합니다.' }, 
        { status: 400 }
      );
    }

    // 사용자 조회
    const user = await AdminUser.findOne({ email }).select('+password_hash');
    if (!user) {
      return NextResponse.json(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 
        { status: 401 }
      );
    }

    // 계정 활성화 확인
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: '비활성화된 계정입니다.' }, 
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 
        { status: 401 }
      );
    }

    // 마지막 로그인 시간 업데이트
    user.last_login_at = new Date();
    await user.save();

    // JWT 토큰 생성
    const tokenPayload: Omit<User, 'iat' | 'exp'> = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role
    };

    const token = await generateToken(tokenPayload);

    // 응답 생성
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

    // 쿠키에 토큰 설정
    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '로그인 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 