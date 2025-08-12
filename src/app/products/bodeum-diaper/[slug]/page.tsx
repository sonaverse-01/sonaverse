'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface DiaperProduct {
  _id: string;
  slug: string;
  name: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
  thumbnail_image: string;
  product_images: string[];
  detail_images: string[];
  category: string;
}

const DiaperProductDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<DiaperProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/diaper-products/${slug}`);
      
      if (!response.ok) {
        throw new Error('제품을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setProduct(data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('제품을 불러올 수 없습니다.');
      router.push('/products/bodeum-diaper');
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedText = (obj: { ko: string; en: string }, lang: string): string => {
    return obj[lang as keyof typeof obj] || obj.ko;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">제품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">제품을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-[#bda191] mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          제품 목록으로 돌아가기
        </button>

        {/* 제품 상세 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* 좌측 - 제품 이미지 */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
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

            {/* 썸네일 이미지들 */}
            {product.product_images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.product_images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
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

          {/* 우측 - 제품 정보 */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-4">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {getLocalizedText(product.name, i18n.language)}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {getLocalizedText(product.description, i18n.language)}
              </p>
            </div>

            {/* 구매 버튼 */}
            <div className="pt-6">
              <a
                href="https://BO DUME.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                제품 구매 문의하기
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 상세 페이지 이미지들 */}
        {product.detail_images.length > 0 && (
          <div className="space-y-0">
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
  );
};

export default DiaperProductDetailPage; 