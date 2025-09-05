'use client';

import React, { useState } from 'react';

interface SonaverseStoryFormData {
  slug: string;
  content: {
    ko: {
      title: string;
      subtitle?: string;
      body: string;
      thumbnail_url?: string;
    };
    en: {
      title: string;
      subtitle?: string;
      body: string;
      thumbnail_url?: string;
    };
  };
  youtube_url?: string;
  tags: {
    ko: string;
    en: string;
  };
  created_at: string;
  is_main?: boolean;
  is_published?: boolean;
}

interface SonaverseStoryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: SonaverseStoryFormData;
}

const SonaverseStoryPreviewModal: React.FC<SonaverseStoryPreviewModalProps> = ({
  isOpen,
  onClose,
  formData
}) => {
  const [selectedLang, setSelectedLang] = useState<'ko' | 'en'>('ko');

  if (!isOpen) return null;

  // 영어 콘텐츠가 없거나 비어있을 경우 한국어로 fallback
  const getCurrentContent = (lang: 'ko' | 'en') => {
    const requestedContent = formData.content[lang];
    const koContent = formData.content.ko;
    
    if (lang === 'en') {
      // 영어 콘텐츠가 있고 제목과 본문이 모두 있는 경우에만 영어 콘텐츠 반환
      if (requestedContent && 
          requestedContent.title && 
          requestedContent.title.trim() !== '' &&
          requestedContent.body && 
          requestedContent.body.trim() !== '') {
        return requestedContent;
      }
      // 영어 콘텐츠가 없거나 비어있으면 한국어로 fallback
      return koContent;
    }
    
    return requestedContent;
  };

  const currentContent = getCurrentContent(selectedLang);
  const thumbnailUrl = currentContent.thumbnail_url || '/logo/nonImage_logo.png';
  const publishDate = formData.created_at ? new Date(formData.created_at).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR');

  // HTML 태그 제거 함수
  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">소나버스 스토리 미리보기</h2>
            
            {/* 언어 선택 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedLang('ko')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedLang === 'ko'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => setSelectedLang('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedLang === 'en'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                English
                {selectedLang === 'en' && !getCurrentContent('en').title && (
                  <span className="ml-1 text-xs text-orange-600">(한국어 표시)</span>
                )}
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex h-[70vh]">
          {/* 좌측: 썸네일 카드 */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">썸네일 카드 미리보기</h3>
            
            {/* 메인 카드 스타일 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="flex flex-col lg:flex-row">
                {/* 이미지 영역 */}
                <div className="lg:w-1/2">
                  <div className="relative h-64 lg:h-full">
                    <img
                      src={thumbnailUrl}
                      alt={currentContent.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png'; }}
                    />
                    {formData.youtube_url && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 콘텐츠 영역 */}
                <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="space-y-4">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                      {currentContent.title}
                    </h2>
                    {currentContent.subtitle && (
                      <p className="text-xl text-gray-600 leading-relaxed">
                        {currentContent.subtitle}
                      </p>
                    )}
                    
                    <div className="pt-6">
                      <time className="text-sm text-gray-500">
                        {publishDate}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 일반 카드 스타일 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <img
                  src={thumbnailUrl}
                  alt={currentContent.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png'; }}
                />
                {formData.youtube_url && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {currentContent.title}
                </h2>
                {currentContent.subtitle && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {currentContent.subtitle}
                  </p>
                )}
                
                <div>
                  <time className="text-sm text-gray-500">
                    {publishDate}
                  </time>
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 상세페이지 */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">상세페이지 미리보기</h3>
            
            <article className="max-w-4xl mx-auto">
              {/* 헤더 */}
              <header className="mb-8">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <time>{publishDate}</time>
                  {formData.tags && formData.tags[selectedLang] && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{formData.tags[selectedLang]}</span>
                    </>
                  )}
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {currentContent.title}
                </h1>
                
                {currentContent.subtitle && (
                  <p className="text-xl text-gray-600 leading-relaxed mb-6">
                    {currentContent.subtitle}
                  </p>
                )}
              </header>

              {/* 썸네일 이미지 */}
              {thumbnailUrl && (
                <div className="mb-8">
                  <img
                    src={thumbnailUrl}
                    alt={currentContent.title}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png'; }}
                  />
                </div>
              )}

              {/* YouTube 비디오 */}
              {formData.youtube_url && (
                <div className="mb-8">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <p>YouTube 비디오</p>
                      <p className="text-sm text-gray-400">{formData.youtube_url}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 본문 */}
              <div className="prose prose-lg max-w-none">
                {currentContent.body ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: currentContent.body }}
                    className="text-gray-800 leading-relaxed"
                  />
                ) : (
                  <p className="text-gray-500 italic">본문 내용이 없습니다.</p>
                )}
              </div>
            </article>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SonaverseStoryPreviewModal;