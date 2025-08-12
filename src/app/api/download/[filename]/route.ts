import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// API 경로: /api/download/[filename]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const resolvedParams = await params;
    const filename = resolvedParams.filename;

    if (!filename) {
      return NextResponse.json({ error: '파일 이름을 찾을 수 없습니다.' }, { status: 400 });
    }

    // URL 디코딩 (한글 파일명 처리)
    const decodedFilename = decodeURIComponent(filename);
    
    // Vercel Blob Storage의 직접 URL 사용
    const baseUrl = 'https://nygcgj07ykqbc0nx.public.blob.vercel-storage.com/downloadFolder/';
    const encodedFileName = encodeURIComponent(decodedFilename);
    const fileUrl = `${baseUrl}${encodedFileName}`;

    try {
      console.log('Downloading file from:', fileUrl);
      
      // 파일을 스트리밍으로 가져오기
      const response = await fetch(fileUrl);

      if (!response.ok) {
        console.error('File not found:', response.status, response.statusText);
        return NextResponse.json(
          { 
            error: `파일을 찾을 수 없습니다: ${decodedFilename}`,
            attempted_url: fileUrl,
            status: response.status
          }, 
          { status: 404 }
        );
      }

      // 파일 확장자에 따른 Content-Type 설정
      let contentType = 'application/octet-stream';
      if (decodedFilename.toLowerCase().endsWith('.pdf')) {
        contentType = 'application/pdf';
      } else if (decodedFilename.toLowerCase().endsWith('.jpg') || decodedFilename.toLowerCase().endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (decodedFilename.toLowerCase().endsWith('.png')) {
        contentType = 'image/png';
      }
      
      // 스트리밍으로 파일 전송 (메모리 효율적)
      const stream = response.body;
      
      return new NextResponse(stream, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(decodedFilename)}"`,
          'Content-Length': response.headers.get('Content-Length') || '',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 1일 캐시
          'ETag': response.headers.get('ETag') || '',
          'Last-Modified': response.headers.get('Last-Modified') || '',
        },
      });

    } catch (error) {
      console.error('File download error:', error);
      return NextResponse.json(
        { 
          error: '파일 다운로드 중 오류가 발생했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error',
          attempted_url: fileUrl
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: '다운로드 요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}