import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { JWT_SECRET, COOKIE_NAME, COOKIE_OPTIONS, User } from './constants';

/**
 * JWT 토큰 생성
 * @param payload - 토큰에 포함할 사용자 정보
 * @returns JWT 토큰 문자열
 */
export async function generateToken(payload: Omit<User, 'iat' | 'exp'>): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
  }
  
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('sonaverse-admin')
    .setAudience('admin-users')
    .setExpirationTime('8h')
    .sign(secret);
    
  return token;
}

/**
 * JWT 토큰 검증
 * @param token - 검증할 JWT 토큰
 * @returns 검증된 사용자 정보 또는 null
 */
export async function verifyToken(token: string): Promise<User | null> {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'sonaverse-admin',
      audience: 'admin-users'
    });
    
    return payload as unknown as User;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * 비밀번호 해시화
 * @param password - 해시화할 비밀번호
 * @returns 해시화된 비밀번호
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * 비밀번호 검증
 * @param password - 검증할 비밀번호
 * @param hashedPassword - 해시화된 비밀번호
 * @returns 비밀번호 일치 여부
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false;
  }
  
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password comparison failed:', error);
    return false;
  }
}

/**
 * 쿠키에서 토큰 가져오기 (서버 사이드)
 * @returns 토큰 문자열 또는 null
 */
export async function getTokenFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    console.log('Getting token from cookie:', token ? `Token exists (length: ${token.length})` : 'No token found');
    
    if (!token) {
      return null;
    }
    
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      console.error('Invalid token format');
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Failed to get token from cookie:', error);
    return null;
  }
}

/**
 * 쿠키에 토큰 설정
 * @param response - NextResponse 객체
 * @param token - 설정할 토큰
 * @returns 수정된 NextResponse 객체
 */
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  if (!token) {
    throw new Error('토큰이 제공되지 않았습니다.');
  }
  
  try {
    console.log('Setting cookie with options:', JSON.stringify(COOKIE_OPTIONS));
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    
    // 추가적으로 Set-Cookie 헤더 확인
    const setCookieHeader = response.headers.get('Set-Cookie');
    console.log('Set-Cookie header:', setCookieHeader);
    
    return response;
  } catch (error) {
    console.error('Failed to set auth cookie:', error);
    throw new Error('쿠키 설정에 실패했습니다.');
  }
}

/**
 * 쿠키에서 토큰 제거
 * @param response - NextResponse 객체
 * @returns 수정된 NextResponse 객체
 */
export function removeAuthCookie(response: NextResponse): NextResponse {
  try {
    response.cookies.set(COOKIE_NAME, '', {
      ...COOKIE_OPTIONS,
      maxAge: 0,
      expires: new Date(0)
    });
    return response;
  } catch (error) {
    console.error('Failed to remove auth cookie:', error);
    throw new Error('쿠키 제거에 실패했습니다.');
  }
}

/**
 * 현재 인증된 사용자 정보 가져오기 (서버 사이드)
 * @returns 사용자 정보 또는 null
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await getTokenFromCookie();
    if (!token) {
      return null;
    }
    
    const user = await verifyToken(token);
    if (!user) {
      return null;
    }
    
    if (user.exp && user.exp < Date.now() / 1000) {
      console.error('Token has expired');
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * 인증 상태 확인 (서버 사이드)
 * @returns 인증 상태
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

/**
 * 미들웨어: 인증 확인 (API 라우트용)
 * @param handler - 보호할 핸들러 함수
 * @returns 인증이 포함된 핸들러 함수
 */
export function requireAuth(handler: Function) {
  return async (req: any, res: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || await getTokenFromCookie();
      
      if (!token) {
        return res.status(401).json({ 
          success: false,
          error: '인증이 필요합니다.' 
        });
      }
      
      const user = await verifyToken(token);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: '유효하지 않은 토큰입니다.' 
        });
      }
      
      req.user = user;
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        success: false,
        error: '인증 처리 중 오류가 발생했습니다.' 
      });
    }
  };
}