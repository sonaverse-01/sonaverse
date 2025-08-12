'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  category: string;
}

interface SonaverseStory {
  _id: string;
  slug: string;
  content: {
    ko: {
      title: string;
      subtitle?: string;
      thumbnail_url?: string;
    };
    en: {
      title: string;
      subtitle?: string;
      thumbnail_url?: string;
    };
  };
  youtube_url?: string;
  tags: string[];
  created_at: string;
  is_published: boolean;
  is_main?: boolean;
}

const BodeumDiaperPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<DiaperProduct[]>([]);
  const [stories, setStories] = useState<SonaverseStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [hoveredImage, setHoveredImage] = useState<string>('/product/bodume/pd_bodume_set.jpg');
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile sliding states for stories section
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchStories();
  }, [selectedCategory]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Auto-sliding functionality for stories
  useEffect(() => {
    if (stories.length <= 2 || isHovered || isDragging) return;

    const maxSlide = Math.max(0, stories.length - 2);
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev >= maxSlide) {
          return 0;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [stories.length, isHovered, isDragging]);

  // Touch/mouse handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endX = e.clientX;
    const diffX = startX - endX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const nextSlide = () => {
    const maxSlide = Math.max(0, stories.length - 2);
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/sonaverse-story?published=true&pageSize=3', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sonaverse stories');
      }
      
      const data = await response.json();
      setStories(data.results || []);
    } catch (error) {
      console.error('Error fetching sonaverse stories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/diaper-products?${params}`);
      
      if (!response.ok) {
          throw new Error('Failed to load product list.');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: t('all_categories', '전체보기') },
    { value: '팬티형', label: t('category_panty', '팬티형') },
    { value: '속기저귀', label: t('category_insert', '속기저귀') },
    { value: '깔개매트', label: t('category_mat', '깔개매트') }
  ];

  const getLocalizedText = (obj: { ko: string; en: string }, lang: string): string => {
    return obj[lang as keyof typeof obj] || obj.ko;
  };

  const handleImageClick = (imagePath: string, event: React.MouseEvent) => {
    if (isMobile) {
      event.stopPropagation();
      setHoveredImage(imagePath);
    }
  };

  const handleContainerClick = (event: React.MouseEvent) => {
    if (isMobile && event.target === event.currentTarget) {
      setHoveredImage('/product/bodume/pd_bodume_set.jpg');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Manual Walkmate BODEUM Hero Section */}
      <section className="bg-white py-6 sm:py-10" onClick={handleContainerClick}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-7 items-stretch min-h-[420px] sm:min-h-[700px]">
            {/* Content - Left Side with Rounded Background */}
            <div className="lg:col-span-4 bg-gradient-to-t from-[#D6BDAD] to-[#EFD1BD] rounded-t-3xl rounded-b-3xl lg:rounded-b-none lg:rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none p-6 sm:p-16 text-gray-800 relative overflow-hidden">
              {/* Product Titles */}
              <div className="space-y-2 sm:space-y-4 mb-8 sm:mb-12">
                <h3 className="text-sm sm:text-lg md:text-xl font-normal text-gray-700">
                  BO DUME
                </h3>
                <h4 className="text-sm sm:text-lg md:text-xl font-normal text-gray-700">
                  프리미엄 성인용 기저귀
                </h4>
                <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold leading-none mt-4 sm:mt-8 text-gray-900">
                  보듬
                </h1>
              </div>
              
              {/* Separator Line */}
              <div className="w-16 sm:w-20 h-0.5 bg-gray-700 mb-6 sm:mb-10"></div>
              
              {/* Product Description */}
              <div className="space-y-2 sm:space-y-4 text-sm sm:text-lg md:text-xl leading-relaxed text-gray-700">              
                <p>피부에 닿는 감촉은 더 부드럽고,</p>
                <p>움직임에는 더 유연하게,</p>
                <p>보듬 팬티가 부모님의 하루를 가볍게,</p>
                <p>당신의 하루를 편안하게 만들어 드립니다.</p>
              </div>
              
              {/* Features Icons - Bottom of left panel */}
              <div className="grid grid-cols-5 gap-2 sm:gap-4 md:gap-6 mt-6 sm:mt-16">
                <div 
                  className="flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredImage('/product/Bbodume/Disposable Underpads_f.jpg')}
                  onMouseLeave={() => setHoveredImage('/product/bodume/pd_bodume_set.jpg')}
                  onClick={(e) => handleImageClick('/product/bodume/Disposable Underpads_f.jpg', e)}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 transition-transform duration-300 group-hover:scale-110">
                    <img src="/product/bodume/Disposable Underpads.png" alt="위생깔개매트" className="w-[calc(100%+1.5px)] h-[calc(100%+1.5px)] object-cover rounded-full -m-[0.5px] transition-transform duration-300 group-hover:scale-105" />
                  </div>
                </div>
                
                <div 
                  className="flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredImage('/product/bodume/Incontinence Pads_Flat Type_f.jpg')}
                  onMouseLeave={() => setHoveredImage('/product/bodume/pd_bodume_set.jpg')}
                  onClick={(e) => handleImageClick('/product/bodume/Incontinence Pads_Flat Type_f.jpg', e)}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 transition-transform duration-300 group-hover:scale-110">
                    <img src="/product/bodume/Incontinence Pads_Flat Type.png" alt="속기저귀_일자형" className="w-[calc(100%+1.5px)] h-[calc(100%+1.5px)] object-cover rounded-full -m-[0.5px] transition-transform duration-300 group-hover:scale-105" />
                  </div>
                </div>
                
                <div 
                  className="flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredImage('/product/bodume/Incontinence Pads_Round Type_f.jpg')}
                  onMouseLeave={() => setHoveredImage('/product/bodume/pd_bodume_set.jpg')}
                  onClick={(e) => handleImageClick('/product/bodume/Incontinence Pads_Round Type_f.jpg', e)}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 transition-transform duration-300 group-hover:scale-110">
                    <img src="/product/bodume/Incontinence Pads_Round Type.png" alt="속기저귀_라운드형" className="w-[calc(100%+1.5px)] h-[calc(100%+1.5px)] object-cover rounded-full -m-[0.5px] transition-transform duration-300 group-hover:scale-105" />
                  </div>
                </div>
                
                <div 
                  className="flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredImage('/product/bodume/Pull-Up Diapers_L_f.jpg')}
                  onMouseLeave={() => setHoveredImage('/product/bodume/pd_bodume_set.jpg')}
                  onClick={(e) => handleImageClick('/product/bodume/Pull-Up Diapers_L_f.jpg', e)}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 transition-transform duration-300 group-hover:scale-110">
                    <img src="/product/bodume/Pull-Up Diapers_L.png" alt="팬티형_대형" className="w-[calc(100%+1.5px)] h-[calc(100%+1.5px)] object-cover rounded-full -m-[0.5px] transition-transform duration-300 group-hover:scale-105" />
                  </div>
                </div>
                <div 
                  className="flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredImage('/product/bodume/Pull-Up Diapers_M_f.jpg')}
                  onMouseLeave={() => setHoveredImage('/product/bodume/pd_bodume_set.jpg')}
                  onClick={(e) => handleImageClick('/product/bodume/Pull-Up Diapers_M_f.jpg', e)}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 transition-transform duration-300 group-hover:scale-110">
                    <img src="/product/bodume/Pull-Up Diapers_M.png" alt="팬티형_중형" className="w-[calc(100%+1.5px)] h-[calc(100%+1.5px)] object-cover rounded-full -m-[0.5px] transition-transform duration-300 group-hover:scale-105" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Image - Right Side */}
            <div className="hidden lg:flex lg:col-span-3 bg-gray-50 rounded-b-3xl lg:rounded-b-3xl lg:rounded-r-3xl lg:rounded-bl-none overflow-hidden relative items-center justify-center">
              <img 
                src={hoveredImage}
                alt="Manual Walkmate BODEUM" 
                className="w-full h-full object-cover transition-all duration-300" 
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
        {/* 헤더 */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('bodeum_diaper', '보듬 기저귀')}
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {t('bodeum_diaper_description', '실제 사용자 경험을 바탕으로 개발된 믿을 수 있는 품질의 성인용 기저귀')}
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제품 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loading_products', '제품 목록을 불러오는 중...')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/products/bodeum-diaper/${product.slug}`}
                className="group block"
              >
                <div className="bg-white border border-gray-200 overflow-hidden transition-all duration-300 group-hover:shadow-lg">
                  {/* 썸네일 이미지 */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.thumbnail_image}
                      alt={getLocalizedText(product.name, i18n.language)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo/nonImage_logo.png';
                      }}
                    />
                  </div>
                  
                  {/* 제품 정보 */}
                  <div className="p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
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
              </Link>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('no_products_found', '등록된 제품이 없습니다.')}</p>
          </div>
        )}
      </div>

      {/* 소나버스 스토리 섹션 - 풀 width */}
      <div className="w-full bg-gradient-to-br from-[#f8f6f4] via-[#f0ece9] to-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('our_story', '우리의 이야기를 만나보세요')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('our_story_desc', '소나버스의 혁신적인 여정과 다양한 이야기를 확인해보세요')}
            </p>
          </div>

          {stories.length > 0 ? (
            <div className="space-y-12">
              {/* 데스크톱 그리드 */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                {stories.slice(0, 3).map((story) => (
                  <article key={story._id} className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <Link href={`/sonaverse-story/${story.slug}`}>
                      <div className="relative">
                        {/* 썸네일 이미지 영역 */}
                        <div className="h-48 bg-gradient-to-br from-[#bda191] via-[#a68b7a] to-[#8f7a6b] relative overflow-hidden">
                          {story.content.ko.thumbnail_url ? (
                            <img
                              src={story.content.ko.thumbnail_url}
                              alt={story.content.ko.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                          )}
                          
                          {/* 기본 콘텐츠 (이미지가 없을 때) */}
                          {!story.content.ko.thumbnail_url && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-lg font-semibold">SONAVERSE Story</span>
                              </div>
                            </div>
                          )}
                          
                          {/* 호버 오버레이 */}
                          <div className="absolute inset-0 bg-[#bda191] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        </div>
                        
                        {/* 콘텐츠 영역 */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-[#bda191] rounded-full"></div>
                            <span className="text-sm text-[#bda191] font-medium">{t('type_story', '소나버스 스토리')}</span>
                          </div>
                          
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-[#bda191] transition-colors duration-300">
                            {story.content[i18n.language as 'ko' | 'en']?.title || story.content.ko.title}
                          </h3>
                          
                          <div className="flex items-center justify-between">
                            <time className="text-sm text-gray-500">
                              {new Date(story.created_at).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </time>
                            <div className="w-6 h-6 text-gray-400 group-hover:text-[#bda191] transition-colors duration-300">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* 모바일/태블릿 슬라이딩 */}
              <div 
                className="lg:hidden overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div 
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 50}%)` }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  {stories.map((story) => (
                    <div 
                      key={story._id}
                      className="flex-none w-1/2 px-2"
                    >
                      <div
                        onClick={() => window.location.href = `/sonaverse-story/${story.slug}`}
                        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer h-full"
                      >
                        {/* 이미지 영역 */}
                        <div className="relative h-32 bg-gradient-to-br from-[#bda191] via-[#a68b7a] to-[#8f7a6b] overflow-hidden">
                          {story.content.ko.thumbnail_url ? (
                            <img
                              src={story.content.ko.thumbnail_url}
                              alt={story.content.ko.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                          )}
                          
                          {/* 기본 콘텐츠 (이미지가 없을 때) */}
                          {!story.content.ko.thumbnail_url && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium">SONAVERSE</span>
                              </div>
                            </div>
                          )}
                          
                          {/* 호버 오버레이 */}
                          <div className="absolute inset-0 bg-[#bda191] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        </div>
                        
                        {/* 텍스트 영역 */}
                        <div className="flex-1 flex flex-col px-4 pb-4 pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-[#bda191] rounded-full"></div>
                            <span className="text-xs text-[#bda191] font-medium">{t('type_story', '스토리')}</span>
                          </div>
                          
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-[#bda191] transition-colors duration-300 line-clamp-2 leading-tight">
                            {story.content[i18n.language as 'ko' | 'en']?.title || story.content.ko.title}
                          </h5>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <time className="text-xs text-gray-500">
                              {new Date(story.created_at).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </time>
                            <div className="w-4 h-4 text-gray-400 group-hover:text-[#bda191] transition-colors duration-300">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 슬라이딩 인디케이터 */}
                {stories.length > 2 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: Math.max(0, stories.length - 1) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          index === currentSlide ? 'bg-[#bda191]' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center">
                <Link href="/sonaverse-story">
                  <button className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-[#bda191] to-[#a68b7a] text-white font-semibold rounded-2xl hover:from-[#a68b7a] hover:to-[#8f7a6b] transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                    <span className="mr-3">{t('view_all', '전체보기')}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('stories_preparing', '스토리가 준비 중입니다.')}</p>
            </div>
          )}
        </div>
      </div>

      {/* CSS for line-clamp */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BodeumDiaperPage; 