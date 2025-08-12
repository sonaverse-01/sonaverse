'use client';

import React, { useState } from 'react';

interface PressFormData {
  slug: string;
  press_name: {
    ko: string;
    en: string;
  };
  external_link: string;
  content: {
    ko: {
      title: string;
      subtitle: string;
      body: string;
      thumbnail_url: string;
      images: any[];
    };
    en: {
      title: string;
      subtitle: string;
      body: string;
      thumbnail_url: string;
      images: any[];
    };
  };
  tags: {
    ko: string;
    en: string;
  };
  created_at: string;
  is_active: boolean;
}

interface PressPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PressFormData;
  thumbnailPreview?: string;
}

const PressPreviewModal: React.FC<PressPreviewModalProps> = ({
  isOpen,
  onClose,
  formData,
  thumbnailPreview
}) => {
  const [selectedLang, setSelectedLang] = useState<'ko' | 'en'>('ko');

  if (!isOpen) return null;

  const currentContent = formData.content[selectedLang];
  const pressName = formData.press_name[selectedLang];
  const thumbnailUrl = thumbnailPreview || currentContent.thumbnail_url || '/logo/nonImage_logo.png';
  const publishDate = formData.created_at ? new Date(formData.created_at).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR');

  // HTML 태그 제거 함수
  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const description = currentContent.body ? stripHtml(currentContent.body).slice(0, 200) + '...' : 'No description available';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">언론보도 미리보기</h2>
            
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
            
            {/* 메인 언론보도 카드 스타일 */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-6">
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={thumbnailUrl}
                  alt={currentContent.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{publishDate}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
                    </svg>
                    <span>{selectedLang === 'ko' ? '언론보도' : 'Press Release'}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4 leading-tight">
                  {currentContent.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                  {description}
                </p>
              </div>
            </div>

            {/* 사이드 카드 스타일 */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="flex">
                <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden">
                  <img 
                    src={thumbnailUrl}
                    alt={currentContent.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png'; }}
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">{publishDate}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                    {currentContent.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {description}
                  </p>
                  <div className="text-xs text-slate-500">
                    {pressName}
                  </div>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <time>{publishDate}</time>
                    <span className="mx-2">•</span>
                    <span>{pressName}</span>
                  </div>
                  {formData.external_link && (
                    <div className="text-sm">
                      <span className="text-blue-600 hover:text-blue-800">
                        외부 링크: {formData.external_link}
                      </span>
                    </div>
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

                {formData.tags[selectedLang] && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {formData.tags[selectedLang].split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
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

              {/* 외부 링크 */}
              {formData.external_link && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium mb-2">원문 링크</p>
                  <p className="text-blue-600 break-all">{formData.external_link}</p>
                </div>
              )}
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

export default PressPreviewModal;