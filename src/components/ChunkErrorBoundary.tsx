'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * 청크 로딩 실패를 처리하는 에러 바운더리
 * Next.js 청크 파일 로딩 실패 시 페이지를 새로고침하여 해결
 */
class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 청크 로딩 에러인지 확인
    const isChunkError = error.message.includes('Loading chunk') || 
                        error.message.includes('ChunkLoadError') ||
                        error.name === 'ChunkLoadError';
    
    return { 
      hasError: true, 
      error: isChunkError ? error : undefined 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ChunkErrorBoundary caught an error:', error, errorInfo);
    
    // 청크 로딩 에러인 경우 페이지 새로고침
    if (error.message.includes('Loading chunk') || 
        error.message.includes('ChunkLoadError') ||
        error.name === 'ChunkLoadError') {
      
      console.log('Detected chunk loading error, refreshing page...');
      
      // 잠시 후 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      // 청크 로딩 에러인 경우 로딩 화면 표시
      if (this.state.error && (
        this.state.error.message.includes('Loading chunk') || 
        this.state.error.message.includes('ChunkLoadError') ||
        this.state.error.name === 'ChunkLoadError'
      )) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h1 className="text-xl font-bold mb-2">페이지를 새로고침하는 중...</h1>
              <p className="text-gray-400">잠시만 기다려주세요.</p>
            </div>
          </div>
        );
      }

      // 다른 에러인 경우 기본 fallback 또는 커스텀 fallback 표시
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">오류가 발생했습니다</h1>
            <p className="mb-4">페이지를 새로고침해주세요.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
