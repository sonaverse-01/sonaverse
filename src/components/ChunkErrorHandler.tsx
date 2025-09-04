'use client';

import { useEffect } from 'react';

/**
 * 청크 로딩 실패를 감지하고 자동으로 페이지를 새로고침하는 컴포넌트
 */
const ChunkErrorHandler = () => {
  useEffect(() => {
    // 청크 로딩 에러를 감지하는 이벤트 리스너
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      
      // 청크 로딩 에러인지 확인
      if (error && (
        error.toString().includes('Loading chunk') ||
        error.toString().includes('ChunkLoadError') ||
        event.filename?.includes('chunks')
      )) {
        console.log('Detected chunk loading error, refreshing page...');
        
        // 잠시 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    // 전역 에러 이벤트 리스너 등록
    window.addEventListener('error', handleChunkError);
    
    // unhandledrejection 이벤트도 처리
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (error && (
        error.toString().includes('Loading chunk') ||
        error.toString().includes('ChunkLoadError')
      )) {
        console.log('Detected chunk loading promise rejection, refreshing page...');
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
};

export default ChunkErrorHandler;
