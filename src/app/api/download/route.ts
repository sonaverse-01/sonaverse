import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET(request: NextRequest) {
    
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'ko';   
    
    // 언어별 파일명 설정
    const fileMap = {
      ko: '보듬_제품소개서_(주)소나버스.pdf',
      en: 'BO DUME_Catalog_ENG_SONAVERSE.pdf'
    };
    
    const fileName = fileMap[lang as keyof typeof fileMap] || fileMap.ko;
        
    try {
      // 먼저 전체 파일 목록을 조회하여 실제 저장 구조 파악
      const { blobs: allBlobs } = await list({
        limit: 1000 // 모든 파일 조회
      });
      
      // 여러 가능한 경로 패턴으로 파일 찾기
      const possiblePaths = [
        `downloadFolder/${fileName}`, // 폴더 구조 포함
        fileName, // 파일명만
        `downloadFolder-${fileName}`, // 접두사 형태
      ];
      
      // 정확한 경로 매칭 먼저 시도
      let targetBlob = allBlobs.find(blob => 
        possiblePaths.some(path => blob.pathname === path)
      );
      
      // 정확한 매칭이 없으면 부분 매칭 시도
      if (!targetBlob) {
        targetBlob = allBlobs.find(blob => 
          blob.pathname.includes(fileName) || 
          blob.pathname.endsWith(fileName)
        );
      }
      
      if (!targetBlob) {        
        allBlobs.forEach(blob => console.log(`  - ${blob.pathname}`));
        
        return NextResponse.json(
          { 
            error: `파일을 찾을 수 없습니다: ${fileName}`,
            availableFiles: allBlobs.map(b => b.pathname)
          },
          { status: 404 }
        );
      }
      
      // Vercel Blob SDK에서 제공하는 URL을 사용하여 직접 다운로드
          
      
      const downloadResponse = await fetch(targetBlob.url);
      
      if (!downloadResponse.ok) {
        console.error(`다운로드 실패: ${downloadResponse.status} ${downloadResponse.statusText}`);
        throw new Error(`파일 다운로드에 실패했습니다: ${downloadResponse.status}`);
      }
      
      // response.body가 있는지 확인하고 스트리밍 여부 결정
      if (!downloadResponse.body) {
        console.log('스트리밍 미지원 - arrayBuffer 방식으로 폴백');
        
        // 스트리밍이 지원되지 않는 경우의 폴백 처리
        const arrayBuffer = await downloadResponse.arrayBuffer();
        
        return new NextResponse(arrayBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
            'Content-Length': String(arrayBuffer.byteLength),
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
      
      // 스트리밍 방식으로 응답 생성
      return new NextResponse(downloadResponse.body, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          'Content-Length': String(targetBlob.size), // SDK에서 제공하는 정확한 파일 크기
          'Cache-Control': 'public, max-age=86400', // 1일 캐시
          'Accept-Ranges': 'bytes', // 부분 다운로드 지원으로 중단된 다운로드 재개 가능
        },
      });
      
    } catch (blobError) {
      console.error('Blob Storage 작업 중 상세 에러:', blobError);
      console.error('에러 스택:', blobError instanceof Error ? blobError.stack : 'No stack trace');
      
      // Blob Storage 관련 에러는 보통 권한이나 설정 문제
      return NextResponse.json(
        { 
          error: 'Blob Storage 접근 중 오류가 발생했습니다.',
          details: blobError instanceof Error ? blobError.message : String(blobError),
          suggestion: 'BLOB_READ_WRITE_TOKEN 환경변수와 파일 업로드 상태를 확인해주세요.'
        },
        { status: 500 }
      );
    }
    
  } catch (outerError) {
    console.error('다운로드 API 최상위 에러:', outerError);
    console.error('에러 스택:', outerError instanceof Error ? outerError.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: '다운로드 요청 처리 중 오류가 발생했습니다.',
        details: outerError instanceof Error ? outerError.message : String(outerError)
      },
      { status: 500 }
    );
  }
}