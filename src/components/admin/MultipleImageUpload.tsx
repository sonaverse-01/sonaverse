'use client';

import React, { useState, useRef } from 'react';

interface MultipleImageUploadProps {
  onImageUpload: (url: string) => void;
  onImageRemove: (index: number) => void;
  currentImages: string[];
  label?: string;
  accept?: string;
  maxSize?: number; // MB
  slug?: string; // 슬러그 추가
  type?: 'product' | 'detail'; // 이미지 타입 추가
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  onImageUpload,
  onImageRemove,
  currentImages,
  label = '이미지 업로드',
  accept = 'image/*',
  maxSize = 10,
  slug = '',
  type = 'product'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증
    if (file.size > maxSize * 1024 * 1024) {
      setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
      return;
    }

    setIsUploading(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      
      // 파일명 생성 (슬러그 + 타입 + 순서)
      const currentCount = currentImages.length;
      const fileExtension = file.name.split('.').pop() || 'jpg';
      let customFilename = '';
      
      if (type === 'product') {
        customFilename = `${slug}_pd${currentCount + 1}`;
      } else if (type === 'detail') {
        customFilename = `${slug}_dtpd${currentCount + 1}`;
      }
      
      formData.append('filename', customFilename);

      // API 호출
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드에 실패했습니다.');
      }

      const data = await response.json();
      onImageUpload(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* 현재 이미지들 표시 */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png';
                }}
              />
              <button
                type="button"
                onClick={() => onImageRemove(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 영역 - 전체 클릭 가능 */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <div className="text-sm text-gray-600">
            {isUploading ? (
              '업로드 중...'
            ) : (
              <>
                클릭하여 파일 선택 또는 드래그 앤 드롭
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            최대 {maxSize}MB, {accept === 'image/*' ? '이미지 파일' : accept}만 가능
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload; 