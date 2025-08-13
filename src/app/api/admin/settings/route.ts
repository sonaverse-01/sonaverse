import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth-server';
import { dbConnect } from '../../../../lib/db';
import AdminSetting from '../../../../models/AdminSetting';

/**
 * GET - 관리자 설정 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    await dbConnect();

    // 설정 조회 (첫 번째 설정 또는 기본값)
    let settings = await AdminSetting.findOne({});
    
    if (!settings) {
      // 기본 설정 생성
      settings = new AdminSetting({
        siteName: { ko: '소나버스', en: 'Sonaverse' },
        siteDescription: { ko: '소나버스 공식 웹사이트', en: 'Sonaverse Official Website' },
        contactEmail: 'contact@sonaverse.kr',
        contactPhone: '02-1234-5678',
        address: { ko: '서울특별시 강남구', en: 'Gangnam-gu, Seoul' },
        socialMedia: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: ''
        }
      });
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json(
      { success: false, error: '설정을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT - 관리자 설정 수정
 */
export async function PUT(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { siteName, siteDescription, contactEmail, contactPhone, address, socialMedia } = body;

    // 입력 검증
    if (!siteName || !siteDescription || !contactEmail) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // 기존 설정 찾기 또는 새로 생성
    let settings = await AdminSetting.findOne({});
    
    if (!settings) {
      settings = new AdminSetting();
    }

    // 설정 업데이트
    if (siteName) settings.siteName = siteName;
    if (siteDescription) settings.siteDescription = siteDescription;
    if (contactEmail) settings.contactEmail = contactEmail;
    if (contactPhone) settings.contactPhone = contactPhone;
    if (address) settings.address = address;
    if (socialMedia) settings.socialMedia = socialMedia;

    await settings.save();

    return NextResponse.json({
      success: true,
      message: '설정이 성공적으로 저장되었습니다.',
      settings
    });
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json(
      { success: false, error: '설정 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST - 관리자 설정 초기화
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    await dbConnect();

    // 기존 설정 삭제
    await AdminSetting.deleteMany({});

    // 기본 설정 생성
    const defaultSettings = new AdminSetting({
      siteName: { ko: '소나버스', en: 'Sonaverse' },
      siteDescription: { ko: '소나버스 공식 웹사이트', en: 'Sonaverse Official Website' },
      contactEmail: 'contact@sonaverse.kr',
      contactPhone: '02-1234-5678',
      address: { ko: '서울특별시 강남구', en: 'Gangnam-gu, Seoul' },
      socialMedia: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
      }
    });

    await defaultSettings.save();

    return NextResponse.json({
      success: true,
      message: '설정이 기본값으로 초기화되었습니다.',
      settings: defaultSettings
    });
  } catch (error) {
    console.error('POST /api/admin/settings error:', error);
    return NextResponse.json(
      { success: false, error: '설정 초기화에 실패했습니다.' },
      { status: 500 }
    );
  }
} 