'use client';

import React from 'react';

interface BrandStoryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  thumbnailPreview?: string;
}

const BrandStoryPreviewModal: React.FC<BrandStoryPreviewModalProps> = ({
  isOpen,
  onClose,
  formData,
  thumbnailPreview
}) => {
  // YouTube URL을 embed 형식으로 변환하는 함수
  const convertYouTubeUrl = (url: string): string => {
    if (!url) return '';
    
    // 이미 embed 형식인 경우
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // 일반 YouTube URL을 embed 형식으로 변환
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`;
    }
    
    return url;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">브랜드 스토리 미리보기</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 썸네일 카드 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">썸네일 카드</h3>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="썸네일"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {formData.content?.ko?.title || '제목 없음'}
                  </h4>
                  {formData.content?.ko?.subtitle && (
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.content.ko.subtitle}
                    </p>
                  )}
                  <div className="text-xs text-gray-500">
                    브랜드 스토리
                  </div>
                </div>
              </div>
            </div>

            {/* 한국어 상세 페이지 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">한국어 상세 페이지</h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  {formData.content?.ko?.title || '제목 없음'}
                </h1>
                {formData.content?.ko?.subtitle && (
                  <h2 className="text-lg text-gray-600 mb-4">
                    {formData.content.ko.subtitle}
                  </h2>
                )}
                
                {/* YouTube 동영상 */}
                {formData.youtube_url && (
                  <div className="mb-6">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={convertYouTubeUrl(formData.youtube_url)}
                        title="YouTube video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
                
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.content?.ko?.body || '<p>내용이 없습니다.</p>' 
                  }}
                />
              </div>
            </div>

            {/* 영어 상세 페이지 */}
            <div className="bg-gray-50 p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">영어 상세 페이지</h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  {formData.content?.en?.title || 'No Title'}
                </h1>
                {formData.content?.en?.subtitle && (
                  <h2 className="text-lg text-gray-600 mb-4">
                    {formData.content.en.subtitle}
                  </h2>
                )}
                
                {/* YouTube 동영상 */}
                {formData.youtube_url && (
                  <div className="mb-6">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={convertYouTubeUrl(formData.youtube_url)}
                        title="YouTube video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
                
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.content?.en?.body || '<p>No content available.</p>' 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
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

export default BrandStoryPreviewModal; 