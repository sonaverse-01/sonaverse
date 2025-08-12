'use client';

import React, { useState } from 'react';

interface IBlogPostImage {
  src: string;
  alt: string;
  alignment: 'left' | 'center' | 'right' | 'full';
  displaysize: number;
  originalWidth: number;
  originalHeight: number;
  uploadAt: Date;
}

interface BlogPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    slug: string;
    content: {
      ko: { title: string; subtitle: string; body: string; thumbnail_url: string; images: IBlogPostImage[] };
      en: { title: string; subtitle: string; body: string; thumbnail_url: string; images: IBlogPostImage[] };
    };
    tags: string;
  };
  thumbnailPreview?: string;
}

const BlogPreviewModal: React.FC<BlogPreviewModalProps> = ({
  isOpen,
  onClose,
  formData,
  thumbnailPreview
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<'ko' | 'en'>('ko');

  // 태그 문자열을 배열로 변환
  const parseTagsToArray = (tagsString: string): string[] => {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  // 이미지 메타데이터를 DOM에 적용하는 함수
  const applyImageMetadata = (content: { body: string; images: IBlogPostImage[] }) => {
    if (!content.images || content.images.length === 0) return content.body;

    // DOM 파서로 HTML 파싱
    const parser = new DOMParser();
    const doc = parser.parseFromString(content.body, 'text/html');
    const images = doc.querySelectorAll('img');

    images.forEach((img) => {
      // 이미지 메타데이터 찾기
      const metadata = content.images?.find(meta => {
        return meta.src === img.src || img.src.includes(meta.src.split('/').pop() || '');
      });

      if (metadata) {
        // 이미지 크기 적용
        img.style.width = `${metadata.displaysize}%`;
        img.style.height = 'auto';
        img.style.maxWidth = '100%';
        img.style.borderRadius = '8px';

        // 정렬 스타일 적용
        if (metadata.alignment === 'left') {
          img.style.float = 'left';
          img.style.margin = '0 16px 12px 0';
          img.style.clear = 'left';
        } else if (metadata.alignment === 'right') {
          img.style.float = 'right';
          img.style.margin = '0 0 12px 16px';
          img.style.clear = 'right';
        } else {
          img.style.float = 'none';
          img.style.margin = '12px auto';
          img.style.display = 'block';
          img.style.clear = 'both';
        }
      }
    });

    return doc.body.innerHTML;
  };

  if (!isOpen) {
    return null;
  }

  const content = formData.content[currentLanguage];
  const tags = parseTagsToArray(formData.tags);
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* 모달 컨테이너 */}
        <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">블로그 포스트 미리보기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* 모달 콘텐츠 */}
          <div className="p-6">

          {/* 언어 선택 탭 */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button 
                  onClick={() => setCurrentLanguage('ko')}
                  className={`py-2 px-1 text-sm font-medium ${
                    currentLanguage === 'ko' 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  한국어
                </button>
                <button 
                  onClick={() => setCurrentLanguage('en')}
                  className={`py-2 px-1 text-sm font-medium ${
                    currentLanguage === 'en' 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  English
                </button>
              </nav>
            </div>
          </div>

          {/* 미리보기 내용 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 썸네일 카드 미리보기 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">썸네일 카드 (블로그 목록)</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow max-w-sm mx-auto">
                  {/* 썸네일 이미지 */}
                  {(thumbnailPreview || content.thumbnail_url) ? (
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={thumbnailPreview || content.thumbnail_url}
                        alt={content.title || '제목을 입력하세요'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">썸네일 이미지 없음</span>
                    </div>
                  )}
                  
                  {/* 카드 콘텐츠 */}
                  <div className="p-4">
                    {/* 제목 */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {content.title || '제목을 입력하세요'}
                    </h3>
                    
                    {/* 부제목 */}
                    <p className="text-gray-600 text-sm mb-3" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {content.subtitle || '부제목을 입력하세요'}
                    </p>
                    
                    {/* 날짜 */}
                    <p className="text-gray-500 text-xs">
                      {currentDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 페이지 미리보기 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">상세 페이지 콘텐츠</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <div className="bg-white rounded-lg p-6">
                  {/* 제목 */}
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {content.title || '제목을 입력하세요'}
                  </h1>
                  
                  {/* 부제목 */}
                  <p className="text-lg text-gray-600 mb-4">
                    {content.subtitle || '부제목을 입력하세요'}
                  </p>
                  
                  {/* 메타 정보 */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                    <span className="text-sm text-gray-500">{currentDate}</span>
                    {tags.length > 0 && (
                      <div className="flex gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* 썸네일 이미지 */}
                  {(thumbnailPreview || content.thumbnail_url) && (
                    <div className="mb-6">
                      <img
                        src={thumbnailPreview || content.thumbnail_url}
                        alt={content.title || '제목을 입력하세요'}
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                  
                  {/* 본문 내용 */}
                  {content.body ? (
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: applyImageMetadata(content) }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">본문 내용을 입력하세요...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

            {/* 모달 푸터 */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewModal; 