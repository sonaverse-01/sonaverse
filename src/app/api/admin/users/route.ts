import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth-server';
import { dbConnect } from '../../../../lib/db';
import AdminUser from '../../../../models/AdminUser';
import bcrypt from 'bcryptjs';

/**
 * GET - 관리자 사용자 목록 조회
 */
export async function GET(request: NextRequest) {
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

    await dbConnect();

    // 모든 관리자 사용자 조회 (비밀번호 제외)
    const users = await AdminUser.find({})
      .select('email username role created_at last_login_at')
      .sort({ created_at: -1 })
      .lean();

    // 응답 데이터 형식 맞추기
    const formattedUsers = users.map(user => ({
      _id: (user._id as any).toString(),
      email: user.email,
      name: user.username,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login_at
    }));

    return NextResponse.json({ users: formattedUsers });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - 새로운 관리자 사용자 생성
 */
export async function POST(request: NextRequest) {
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

    const { email, name, password, role = 'admin' } = await request.json();

    // 필수 필드 검증
    if (!email || !name || !password) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '유효한 이메일 형식이 아닙니다.' }, { status: 400 });
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 최소 6자 이상이어야 합니다.' }, { status: 400 });
    }

    await dbConnect();

    // 중복 이메일 확인
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: '이미 존재하는 이메일입니다.' }, { status: 400 });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 새 관리자 사용자 생성
    const newUser = new AdminUser({
      email,
      username: name,
      password_hash: hashedPassword,
      role,
      created_at: new Date()
    });

    await newUser.save();

    return NextResponse.json({ 
      message: '관리자 계정이 성공적으로 생성되었습니다.',
      user: {
        _id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.username,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Create admin user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

 