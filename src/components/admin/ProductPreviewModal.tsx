'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DiaperProduct {
  _id?: string;
  slug: string;
  name: { ko: string; en: string; };
  description: { ko: string; en: string; };
  thumbnail_image: string;
  product_images: string[];
  detail_images: string[];
  category: string;
  is_active?: boolean;
  created_at?: string;
}

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: DiaperProduct | null;
}

const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({ isOpen, onClose, product }) => {
  const { t, i18n } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getLocalizedText = (obj: { ko: string; en: string }, lang: string): string => {
    return obj[lang as keyof typeof obj] || obj.ko;
  };

  if (!product) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">제품 미리보기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-8">
            {/* Thumbnail Card Preview */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">썸네일 카드 미리보기</h3>
              <div className="group block w-64 mx-auto">
                <div className="bg-white border border-gray-200 overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={product.thumbnail_image} 
                      alt={getLocalizedText(product.name, i18n.language)} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {getLocalizedText(product.name, i18n.language)}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {getLocalizedText(product.description, i18n.language)}
                    </p>
                    <div className="mt-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Detail Page Preview */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">제품 상세 페이지 미리보기</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Product Images */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={product.product_images[currentImageIndex] || product.thumbnail_image} 
                      alt={getLocalizedText(product.name, i18n.language)} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png';
                      }}
                    />
                  </div>
                  {product.product_images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {product.product_images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img 
                            src={image} 
                            alt={`${getLocalizedText(product.name, i18n.language)} ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Right: Product Info */}
                <div className="space-y-4">
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {product.category}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {getLocalizedText(product.name, i18n.language)}
                  </h1>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {getLocalizedText(product.description, i18n.language)}
                  </p>
                  <a 
                    href="/inquiry" 
                    className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    제품 구매 문의하기
                  </a>
                </div>
              </div>
            </div>

            {/* Detail Images */}
            {product.detail_images.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-2">상세 이미지</h3>
                {product.detail_images.map((image, index) => (
                  <div key={index} className="w-full">
                    <img 
                      src={image} 
                      alt={`${getLocalizedText(product.name, i18n.language)} 상세 이미지 ${index + 1}`} 
                      className="w-full h-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewModal; 