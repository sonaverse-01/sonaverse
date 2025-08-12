'use client';

import React from 'react';

interface ImageControlsProps {
  onSizeChange: (size: string) => void;
  onAlignChange: (align: string) => void;
  onDelete: () => void;
  currentSize: string;
  currentAlignment: string;
  position: { top: number; right: number };
}

const ImageControls: React.FC<ImageControlsProps> = ({
  onSizeChange,
  onAlignChange,
  onDelete,
  currentSize,
  currentAlignment,
  position
}) => {
  return (
    <div 
      className="fixed bg-white rounded-lg shadow-lg p-2 flex flex-wrap gap-1 max-w-xs z-[9999] border"
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      {/* 크기 조정 제목 */}
      <div className="w-full text-xs text-gray-600 font-medium mb-1 text-center">
        📏 이미지 크기 (콘텐츠 기준)
      </div>
      
      {/* 크기 조정 버튼들 */}
      <div className="flex gap-1 w-full">
        <button
          type="button"
          onClick={() => onSizeChange('25%')}
          className={`flex-1 px-2 py-1 text-xs rounded transition-all duration-200 font-medium ${
            currentSize === '25%' 
              ? 'bg-blue-500 text-white shadow-md scale-105' 
              : 'bg-blue-100 hover:bg-blue-200 hover:scale-105'
          }`}
          title="콘텐츠 너비의 25%"
        >
          25%
        </button>
        <button
          type="button"
          onClick={() => onSizeChange('50%')}
          className={`flex-1 px-2 py-1 text-xs rounded transition-all duration-200 font-medium ${
            currentSize === '50%' 
              ? 'bg-blue-500 text-white shadow-md scale-105' 
              : 'bg-blue-100 hover:bg-blue-200 hover:scale-105'
          }`}
          title="콘텐츠 너비의 50%"
        >
          50%
        </button>
        <button
          type="button"
          onClick={() => onSizeChange('75%')}
          className={`flex-1 px-2 py-1 text-xs rounded transition-all duration-200 font-medium ${
            currentSize === '75%' 
              ? 'bg-blue-500 text-white shadow-md scale-105' 
              : 'bg-blue-100 hover:bg-blue-200 hover:scale-105'
          }`}
          title="콘텐츠 너비의 75%"
        >
          75%
        </button>
        <button
          type="button"
          onClick={() => onSizeChange('100%')}
          className={`flex-1 px-2 py-1 text-xs rounded transition-all duration-200 font-medium ${
            currentSize === '100%' 
              ? 'bg-blue-500 text-white shadow-md scale-105' 
              : 'bg-blue-100 hover:bg-blue-200 hover:scale-105'
          }`}
          title="콘텐츠 너비의 100%"
        >
          100%
        </button>
      </div>
      
      {/* 구분선 */}
      <div className="w-full h-px bg-gray-300 my-1"></div>
      
      {/* 정렬 제목 */}
      <div className="w-full text-xs text-gray-600 font-medium mb-1 text-center">
        🎯 이미지 정렬
      </div>
      
      {/* 정렬 버튼들 */}
      <div className="flex gap-1 w-full">
        <button
          type="button"
          onClick={() => onAlignChange('left')}
          className={`flex-1 px-2 py-1 text-xs rounded transition-all duration-200 flex items-center justify-center ${
            currentAlignment === 'left' 
              ? 'bg-green-500 text-white shadow-md scale-105' 
              : 'bg-green-100 hover:bg-green-200 hover:scale-105'
          }`}
          title="왼쪽 정렬 (텍스트가 오른쪽으로 흐름)"
        >
          ← 좌측
        </button>
        <button
          type="button"
          onClick={() => onAlignChange('center')}
          className={`flex-1 px-2 py-1 text-xs rounded transition-all duration-200 flex items-center justify-center ${
            currentAlignment === 'center' 
              ? 'bg-green-500 text-white shadow-md scale-105' 
              : 'bg-green-100 hover:bg-green-200 hover:scale-105'
          }`}
          title="가운데 정렬"
        >
          ↔ 중앙
        </button>
        <button
          type="button"
          onClick={() => onAlignChange('right')}
          className={`flex-1 px-2 py-1 text-xs rounded transition-all duration-200 flex items-center justify-center ${
            currentAlignment === 'right' 
              ? 'bg-green-500 text-white shadow-md scale-105' 
              : 'bg-green-100 hover:bg-green-200 hover:scale-105'
          }`}
          title="오른쪽 정렬 (텍스트가 왼쪽으로 흐름)"
        >
          → 우측
        </button>
      </div>
      
      {/* 구분선 */}
      <div className="w-full h-px bg-gray-300 my-1"></div>
      
      {/* 삭제 버튼 */}
      <button
        type="button"
        onClick={onDelete}
        className="w-full px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded transition-colors"
        title="이미지 삭제"
      >
        🗑️ 삭제
      </button>
    </div>
  );
};

export default ImageControls; 