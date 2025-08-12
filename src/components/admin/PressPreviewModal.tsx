'use client';

import React from 'react';

interface PressPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  thumbnailPreview?: string;
}

const PressPreviewModal: React.FC<PressPreviewModalProps> = ({
  isOpen,
  onClose,
  formData,
  thumbnailPreview
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">언론보도 미리보기</h2>
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
                    언론보도
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

export default PressPreviewModal; 