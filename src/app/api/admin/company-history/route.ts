import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth-server';
import { dbConnect } from '../../../../lib/db';
// import CompanyHistory from '../../../../models/CompanyHistory'; // 모델이 존재하지 않음

/**
 * GET - 회사 연혁 목록 조회
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Company history API is not implemented' },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Company history API is not implemented' },
    { status: 404 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Company history API is not implemented' },
    { status: 404 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Company history API is not implemented' },
    { status: 404 }
  );
} 