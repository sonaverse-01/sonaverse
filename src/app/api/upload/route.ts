import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 체크
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return NextResponse.json(
        { error: 'Blob storage가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customFilename = formData.get('filename') as string;
    const type = formData.get('type') as string; // 'thumbnail', 'editor', 'general'
    const folder = formData.get('folder') as string; // 폴더 경로 (예: 'press', 'sonaverseStory')

    console.log('Upload request:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      customFilename, 
      folder 
    });

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // 파일명 생성
    let fileName: string;
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';

    // 폴더 경로가 있으면 폴더/파일명 형태로 생성
    let filePath: string;
    
    if (customFilename) {
      // 커스텀 파일명 사용 (요구사항: [slug]_thumbnail, [slug]_ko_01~ 형태)
      fileName = `${customFilename}.${fileExtension}`;
    } else if (type === 'editor') {
      // 에디터용 이미지 (요구사항에 맞게 수정 필요)
      fileName = `content_${timestamp}.${fileExtension}`;
    } else {
      // 일반 업로드
      fileName = `upload_${timestamp}_${file.name}`;
    }

    // 폴더가 지정되었으면 blob/폴더경로 형태로 생성 (요구사항: blob/press/[slug]/ 형태)
    if (folder) {
      filePath = `blob/${folder}/${fileName}`;
    } else {
      filePath = fileName;
    }

    // Vercel Blob에 업로드
    console.log('Attempting blob upload:', { filePath, fileSize: file.size });
    const blob = await put(filePath, file, { 
      access: 'public',
      addRandomSuffix: false, // 파일명 중복 방지를 위해 false로 설정
      allowOverwrite: true // 기존 파일 덮어쓰기 허용
    });
    console.log('Blob upload successful:', blob.url);

    return NextResponse.json({
      url: blob.url,
      fileName: filePath,
      originalName: file.name,
      size: file.size,
      type: file.type,
      success: true
    });

  } catch (error) {
    console.error('Upload error details:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      blobToken: process.env.BLOB_READ_WRITE_TOKEN ? 'Set' : 'Not set'
    });
    return NextResponse.json(
      { 
        error: '업로드 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 