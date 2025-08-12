'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductPreviewModal from '@/components/admin/ProductPreviewModal';

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
  is_active: boolean;
  created_at: string;
}

const DiaperProductsPage: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<DiaperProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [previewProduct, setPreviewProduct] = useState<DiaperProduct | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/admin/diaper-products?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('제품 목록을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('정말로 이 제품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/diaper-products/${slug}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert('제품 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('제품 삭제에 실패했습니다.');
    }
  };

  const handlePreview = (product: DiaperProduct) => {
    setPreviewProduct(product);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">제품 관리</h1>
        <Link
          href="/admin/diaper-products/new"
          className="bg-yellow-400 text-black px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-center text-sm sm:text-base"
        >
          새 제품 추가
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              검색
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제품명으로 검색..."
              className="w-full p-2 sm:p-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              카테고리
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">전체</option>
              <option value="팬티형">팬티형</option>
              <option value="속기저귀">속기저귀</option>
              <option value="깔개매트">깔개매트</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchProducts}
              className="w-full bg-yellow-400 text-black px-4 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-sm sm:text-base"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 제품 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">제품 목록을 불러오는 중...</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    썸네일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    제품명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={product.thumbnail_image}
                          alt={product.name.ko}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png';
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {product.name.ko}
                          </div>
                          <div className="text-sm text-gray-400">
                            {product.name.en}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(product.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePreview(product)}
                            className="text-green-400 hover:text-green-300"
                          >
                            미리보기
                          </button>
                          <Link
                            href={`/admin/diaper-products/${product.slug}/edit`}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() => handleDelete(product.slug)}
                            className="text-red-400 hover:text-red-300"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400">등록된 제품이 없습니다.</p>
          </div>
        )}

      {/* 미리보기 모달 */}
      <ProductPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewProduct(null);
        }}
        product={previewProduct}
      />
    </div>
  );
};

export default DiaperProductsPage; 