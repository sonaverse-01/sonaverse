'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload';
import MultipleImageUpload from '@/components/admin/MultipleImageUpload';
import ProductPreviewModal from '@/components/admin/ProductPreviewModal';
import SlugChecker from '@/components/admin/SlugChecker';

interface FormData {
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
  is_active: boolean;
}

const NewDiaperProductPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    slug: '',
    name: { ko: '', en: '' },
    description: { ko: '', en: '' },
    thumbnail_image: '',
    product_images: [],
    detail_images: [],
    category: '팬티형',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<FormData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hasSlugConflict, setHasSlugConflict] = useState(false);
  const [isSlugValidated, setIsSlugValidated] = useState(false);

  const handlePreview = () => {
    if (!formData.slug || !formData.name.ko || !formData.name.en) {
      alert('미리보기를 위해 슬러그, 제품명(한국어), 제품명(영어)을 입력해주세요.');
      return;
    }
    setPreviewProduct(formData);
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.slug || !formData.name.ko || !formData.name.en) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (!isSlugValidated) {
      alert('슬러그 중복 확인을 완료해주세요.');
      return;
    }

    if (hasSlugConflict) {
      alert('슬러그가 중복됩니다. 다른 슬러그를 사용해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/diaper-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('제품이 성공적으로 생성되었습니다.');
        router.push('/admin/diaper-products');
      } else {
        const error = await response.json();
        alert(error.error || '제품 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('제품 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 영문, 하이픈, 숫자만 허용
    const sanitizedValue = value.replace(/[^a-zA-Z0-9-]/g, '');
    handleInputChange('slug', sanitizedValue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">새 제품 추가</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors w-full sm:w-auto text-sm sm:text-base"
          >
            뒤로가기
          </button>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  슬러그 *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="product-slug"
                    className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                  <div className="flex-shrink-0">
                    <SlugChecker 
                      slug={formData.slug} 
                      onCheck={setHasSlugConflict}
                      onValidated={setIsSlugValidated}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="팬티형">팬티형</option>
                  <option value="속기저귀">속기저귀</option>
                  <option value="깔개매트">깔개매트</option>
                </select>
              </div>
            </div>

            {/* 제품명 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제품명 (한국어) *
                </label>
                <input
                  type="text"
                  value={formData.name.ko}
                  onChange={(e) => handleInputChange('name.ko', e.target.value)}
                  placeholder="제품명을 입력하세요"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제품명 (영어) *
                </label>
                <input
                  type="text"
                  value={formData.name.en}
                  onChange={(e) => handleInputChange('name.en', e.target.value)}
                  placeholder="Product name"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* 설명 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 (한국어) *
                </label>
                <textarea
                  value={formData.description.ko}
                  onChange={(e) => handleInputChange('description.ko', e.target.value)}
                  placeholder="제품 설명을 입력하세요"
                  rows={4}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 (영어) *
                </label>
                <textarea
                  value={formData.description.en}
                  onChange={(e) => handleInputChange('description.en', e.target.value)}
                  placeholder="Product description"
                  rows={4}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 이미지 *
                </label>
                <ImageUpload
                  onImageUpload={(url: string) => handleInputChange('thumbnail_image', url)}
                  currentImage={formData.thumbnail_image}
                  slug={formData.slug}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제품 이미지들 *
                </label>
                <MultipleImageUpload
                  onImageUpload={(url: string) => {
                    setFormData(prev => ({
                      ...prev,
                      product_images: [...prev.product_images, url]
                    }));
                  }}
                  onImageRemove={(index: number) => {
                    setFormData(prev => ({
                      ...prev,
                      product_images: prev.product_images.filter((_, i) => i !== index)
                    }));
                  }}
                  currentImages={formData.product_images}
                  slug={formData.slug}
                  type="product"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 페이지 이미지들
                </label>
                <MultipleImageUpload
                  onImageUpload={(url: string) => {
                    setFormData(prev => ({
                      ...prev,
                      detail_images: [...prev.detail_images, url]
                    }));
                  }}
                  onImageRemove={(index: number) => {
                    setFormData(prev => ({
                      ...prev,
                      detail_images: prev.detail_images.filter((_, i) => i !== index)
                    }));
                  }}
                  currentImages={formData.detail_images}
                  slug={formData.slug}
                  type="detail"
                />
              </div>
            </div>

            {/* 상태 - 항상 활성화로 설정 */}
            <input type="hidden" value="true" />

            {/* 제출 버튼 */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handlePreview}
                className="bg-gray-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                미리보기
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !isSlugValidated || hasSlugConflict}
                className="bg-blue-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? '생성 중...' : '제품 생성'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ProductPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        product={previewProduct}
      />
    </div>
  );
};

export default NewDiaperProductPage; 