'use client';

import { useEffect } from 'react';

/**
 * 청크 로딩 실패를 감지하고 자동으로 페이지를 새로고침하는 컴포넌트
 * 서비스워커 및 캐시 정리 기능 포함
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
        console.log('Detected chunk loading error, cleaning cache and refreshing page...');
        
        // 서비스워커 및 캐시 정리 후 페이지 새로고침
        cleanupAndReload();
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
        console.log('Detected chunk loading promise rejection, cleaning cache and refreshing page...');
        
        cleanupAndReload();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // 서비스워커 및 캐시 정리 후 페이지 새로고침
  const cleanupAndReload = async () => {
    try {
      // 캐시 정리
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('Cleared all caches');
      }
      
      // 서비스워커 해제
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
        console.log('Unregistered all service workers');
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      // 버전 파라미터를 추가하여 강제 새로고침
      const url = new URL(window.location.href);
      url.searchParams.set('v', Date.now().toString());
      window.location.href = url.toString();
    }
  };

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
};

export default ChunkErrorHandler;
