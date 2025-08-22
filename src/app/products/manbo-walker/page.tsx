'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../contexts/LanguageContext';

// 이미지 비율에 따른 자동 object-fit 컴포넌트
const AdaptiveImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}> = ({ src, alt, className = '', onError }) => {
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('contain');

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    // 가로가 세로보다 긴 경우 (가로형) cover, 그 외는 contain
    setObjectFit(aspectRatio > 1 ? 'cover' : 'contain');
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
      onLoad={handleImageLoad}
      onError={onError}
    />
  );
};

interface SonaverseStory {
  _id: string;
  slug: string;
  thumbnail_url?: string;
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

const ManboWalkerPage: React.FC = () => {
  const { language, isClient } = useLanguage();
  const [stories, setStories] = useState<SonaverseStory[]>([]);
  
  // Mobile sliding states for stories section
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // LanguageContext의 language 상태만 사용 (SSR 일관성 보장)

  const getSonaverseStories = async () => {
    try {
      const response = await fetch('/api/sonaverse-story?published=true&pageSize=3', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sonaverse stories');
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching sonaverse stories:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchStories = async () => {
      const fetchedStories = await getSonaverseStories();
      setStories(fetchedStories);
    };
    
    fetchStories();
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

  return (
    <div className="w-full bg-white">
      {/* Manual Walkmate MANBO Hero Section */}
      <section className="bg-white py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-7 items-stretch min-h-[420px] sm:min-h-[700px]">
            {/* Content - Left Side with Rounded Background */}
            <div className="lg:col-span-4 bg-gradient-to-t from-[#102643] to-[#1C4376] rounded-t-3xl rounded-b-3xl lg:rounded-b-none lg:rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none p-6 sm:p-16 text-white relative overflow-hidden">
              {/* Product Titles */}
              <div className="space-y-2 sm:space-y-4 mb-8 sm:mb-12">
                <h2 className="text-sm sm:text-lg md:text-xl font-normal">
                  MANBO
                </h2>
                <h3 className="text-sm sm:text-lg md:text-xl font-normal">
                  {language === 'en' ? 'Hybrid Walkmate' : '하이브리드형 워크메이트'}
                </h3>
                <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold leading-none mt-4 sm:mt-8">
                  {language === 'en' ? 'MANBO' : '만보'}
                </h1>
              </div>
              
              {/* Separator Line */}
              <div className="w-16 sm:w-20 h-0.5 bg-white mb-6 sm:mb-10"></div>
              
              {/* Product Description */}
              <div className="space-y-2 sm:space-y-4 text-sm sm:text-lg md:text-xl leading-relaxed">
                {language === 'en' ? (
                  <>
                    <p>Enhanced safety with a differentiated bar-handle and single-frame design,</p>
                    <p>Convenience with smart functions including slope control,</p>
                    <p>Maximized user satisfaction,</p>
                    <p>The only hybrid <span className="text-red-400 font-semibold">Walkmate</span> in Korea.</p>
                  </>
                ) : (
                  <>
                    <p>바형 손잡이와 통 프레임의 차별화된 설계로 안전성을 갖춘,</p>
                    <p>경사시 제어를 포함한 스마트 기능의 편의성을 갖춘,</p>
                    <p>사용자 만족도를 극대화한</p>
                    <p>국내 유일 하이브리드형 <span className="text-red-400 font-semibold">워크메이트</span>.</p>
                  </>
                )}
              </div>
              
              {/* Features Icons - Bottom of left panel */}
              <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-16">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mb-2">
                    <img src="/product/manbo/pd_manbo_sub1.png" alt={language === 'en' ? 'Handle adjustment' : '손잡이 조절'} className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mb-2">
                    <img src="/product/manbo/pd_manbo_sub2.png" alt={language === 'en' ? 'Frame structure' : '프레임 구조'} className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mb-2">
                    <img src="/product/manbo/pd_manbo_sub3.png" alt={language === 'en' ? 'Brake system' : '브레이크 시스템'} className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mb-2">
                    <img src="/product/manbo/pd_manbo_sub4.png" alt={language === 'en' ? 'Multi-layer storage' : '다층 수납'} className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Image - Right Side (hidden on mobile) */}
            <div className="hidden lg:flex lg:col-span-3 bg-gray-50 rounded-b-3xl lg:rounded-b-3xl lg:rounded-r-3xl lg:rounded-bl-none overflow-hidden relative items-center justify-center">
              <img 
                src="/product/manbo/pd_manbo_main.png" 
                alt="Manual Walkmate MANBO" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
              {language === 'en' ? 'Limitations of Existing Walkers' : '기존 보행기의 한계점'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-4xl mx-auto">
              {language === 'en' ? 'Market research revealed actual problems experienced by users.' : '시장 조사 결과, 사용자들이 겪고 있는 실제 문제점들을 발견했습니다.'}
            </p>
          </div>

          {/* Pain Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden h-[440px] sm:h-[500px] flex flex-col justify-end relative">
              <div className="absolute top-7 left-7 z-10">
                <img src="/product/manbo/pd_manbo_pain_sub1_icon.svg" alt="아이콘" className="w-8 h-8" />
              </div>
              <div className="absolute top-16 left-7 right-7 z-10">
                {language === 'en' ? (
                  <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 mb-3 mt-3">
                    Safety and Performance Limitations
                  </h3>
                ) : (
                  <>
                    <h3 className="text-sm sm:text-base md:text-lg text-slate-900 mt-3">안전성 및</h3>
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 mb-3">성능의 한계</h3>
                  </>
                )}
                <div className="w-6 sm:w-8 h-0.5 bg-slate-300 mb-3"></div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {language === 'en'
                    ? (
                      <>Increased accident risk due to <strong>insufficient braking and propulsion</strong> on irregular terrain and <strong>lack of control systems</strong> that support safe driving in various environments</>
                    ) : (
                      <>불규칙한 지형이나 경사면에서 <strong>제동·추진력 부족</strong>으로 사고 위험 증가 및 다양한 환경에서 <strong>안전한 주행을 지원하는 제어 시스템 부재</strong></>
                    )}
                </p>
              </div>
              <div className="h-[20%] sm:h-[30%]"></div>
              <div className="h-[80%] sm:h-[70%] w-full">
                <img src="/product/manbo/pd_manbo_pain_sub1.png" alt="기존 보행 보조기구 한계" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden h-[440px] sm:h-[500px] flex flex-col justify-start relative">
              <div className={`w-full ${language === 'en' ? 'h-[62%] sm:h-[72%]' : 'h-[60%] sm:h-[70%]'}`}>
                <img src="/product/manbo/pd_manbo_pain_sub2.png" alt="기존 보행 보조기구 한계" className="w-full h-full object-cover" />
              </div>
              <div className="h-[30%] relative">
                <div className={`absolute ${language === 'en' ? '-top-[85%]' : '-top-1/2'} left-7 transform -translate-y-1/2`}>
                  <img src="/product/manbo/pd_manbo_pain_sub2_icon.svg" alt="아이콘" className="w-8 h-8" />
                </div>
                <div className="absolute bottom-10 left-7 right-7">
                  {language === 'en' ? (
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 mb-3">Design Without Psychological Satisfaction</h3>
                  ) : (
                    <>
                      <h3 className="text-sm sm:text-base md:text-lg text-slate-900">심리적 만족감을</h3>
                      <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 mb-3">고려하지 않은 디자인</h3>
                    </>
                  )}
                  <div className="w-6 sm:w-8 h-0.5 bg-slate-300 mb-3"></div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {language === 'en'
                      ? (<>Lack of consideration for seniors&apos; emotional stability and self-esteem leads to <strong>a design that feels out of place</strong> in daily life</>)
                      : (<>시니어의 정서적 안정과 자존감을 고려하지 않아 일상에서 <strong>이질감이 드는 외관 디자인</strong></>)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden h-[440px] sm:h-[500px] flex flex-col justify-end relative">
              <div className="absolute top-7 left-7 z-10">
                <img src="/product/manbo/pd_manbo_pain_sub3_icon.svg" alt="아이콘" className="w-8 h-8" />
              </div>
              <div className="absolute top-16 left-7 right-7 z-10">
                {language === 'en' ? (
                  <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 mb-3 mt-3">Insufficient User-Centered Ergonomic Design</h3>
                ) : (
                  <>
                    <h3 className="text-sm sm:text-base md:text-lg text-slate-900 mt-3">사용자 중심의</h3>
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 mb-3">인체공학 설계 미흡</h3>
                  </>
                )}
                <div className="w-6 sm:w-8 h-0.5 bg-slate-300 mb-3"></div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {language === 'en'
                    ? (<>Design that fails to reflect seniors&apos; body types, motor abilities, and usage habits leads to <strong>fatigue accumulation during long-term use</strong> and difficulty in continued use</>)
                    : (<>시니어의 체형과 운동 능력, 사용 습관을 반영하지 못한 설계로 <strong>장시간 사용 시 피로 누적 및 지속 사용 곤란</strong></>)}
                </p>
              </div>
              <div className="h-[20%] sm:h-[30%]"></div>
              <div className="h-[80%] sm:h-[70%] w-full">
                <img src="/product/manbo/pd_manbo_pain_sub3.png" alt="기존 보행 보조기구 한계" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden h-[440px] sm:h-[500px] flex flex-col justify-start relative">
              <div className={`w-full ${language === 'en' ? 'h-[62%] sm:h-[72%]' : 'h-[60%] sm:h-[70%]'}`}>
                <img src="/product/manbo/pd_manbo_pain_sub4.png" alt="기존 보행 보조기구 한계" className="w-full h-full object-cover" />
              </div>
              <div className="h-[30%] relative">
                <div className={`absolute ${language === 'en' ? '-top-3/4' : '-top-1/2'} left-7 transform -translate-y-1/2`}>
                  <img src="/product/manbo/pd_manbo_pain_sub4_icon.svg" alt="아이콘" className="w-8 h-8" />
                </div>
                <div className="absolute bottom-6 left-7 right-7">
                  {language === 'en' ? (
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 mb-3">Technology Blind Spots in the Aging Era</h3>
                  ) : (
                    <>
                      <h3 className="text-sm sm:text-base md:text-lg text-slate-900">고령화 시대 속</h3>
                      <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 mb-3">기술 사각지대</h3>
                    </>
                  )}
                  <div className="w-6 sm:w-8 h-0.5 bg-slate-300 mb-3"></div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {language === 'en'
                      ? (<>Delayed market progress as the pace of adopting AI/sensor technologies among seniors and daily life-needed technologies are not applied</>)
                      : (<>AI·센서 등 최신 기술은 시니어가 받아들이는 속도와 일상생활에서 필요한 기술은 적용되지 않아 <strong>시장의 발전 지연</strong></>)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
                {language === 'en' ? 'Next-Generation Hybrid Walkmate with Dual Drive' : '듀얼 구동 방식을 적용한 차세대 하이브리드 워크 메이트'}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600">
                {language === 'en' ? 'Enhanced safety with a differentiated bar handle and single frame design' : '바람 손잡이와 통 프레임의 차별화된 설계로 안전성을 강화'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold">1</span>
                  </div>
                  <div>
                      <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 text-slate-900">{language === 'en' ? 'Hybrid Drive System' : '하이브리드 주행 시스템'}</h3>
                    <ul className="space-y-1 text-xs sm:text-sm text-slate-600">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                          {language === 'en' ? 'Choose between powered and non-powered modes' : '전동과 비전동 모드 자유선택'}
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                          {language === 'en' ? 'Flexible across various walking environments' : '다양한 보행환경 유연대응'}
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold">2</span>
                  </div>
                  <div>
                      <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 text-slate-900">{language === 'en' ? 'Slope Control Functions' : '경사지 제어 기능'}</h3>
                    <ul className="space-y-1 text-xs sm:text-sm text-slate-600">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                          {language === 'en' ? 'Uphill propulsion' : '오르막 추진력 제공'}
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                          {language === 'en' ? 'Downhill auto-braking' : '내리막 자동제동'}
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                          {language === 'en' ? 'Smart safety control' : '스마트 안전제어'}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold">3</span>
                  </div>
                  <div>
                      <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 text-slate-900">{language === 'en' ? 'Micro Motor Application' : '미세 모터 적용'}</h3>
                    <ul className="space-y-1 text-xs sm:text-sm text-slate-600">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                          {language === 'en' ? 'Responsive to user force and speed' : '사용자 힘과 속도 연동'}
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                          {language === 'en' ? 'Precision drive control' : '미세 구동 제어'}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-3 flex justify-center">
                <div className="relative w-full max-w-full rounded-2xl overflow-hidden shadow-2xl">
                  <div className="flex">
                    <img src="\product\manbo\pd_manbo_Hybrid1.png" alt="오르막 추진력 기능" className="w-1/2 h-auto object-cover" />
                    <img src="\product\manbo\pd_manbo_Hybrid2.png" alt="내리막 제동력 기능" className="w-1/2 h-auto object-cover" />
                  </div>
                  {/* 중앙 연결선 */}
                  <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent transform -translate-x-1/2"></div>
                  
                  {/* 하단 설명 문구 */}
                  <div className="absolute bottom-0 left-0 right-0 flex">
                    <div className="w-1/2 text-center py-1 sm:py-3 md:py-5">
                      <span className="text-xs sm:text-sm md:text-lg font-semibold text-white">{language === 'en' ? 'Propulsion' : '추진력 제공'}</span>
                    </div>
                    <div className="w-1/2 text-center py-1 sm:py-3 md:py-5">
                      <span className="text-xs sm:text-sm md:text-lg font-semibold text-white">{language === 'en' ? 'Support & Braking' : '지지력·제동력 제공'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Features */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
              {language === 'en' ? 'Intelligent Care Technology with Both Prevention and Response Functions' : '예방과 대응 기능을 모두 담은 지능 케어 기술'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
               <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">{language === 'en' ? 'Emergency Auto-Stop' : '비상 시 자동 정지 기능'}</h3>
               <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">{language === 'en' ? 'Sensor-responsive brake stops immediately in emergencies to prevent accidents' : '센서 반응형 브레이크 탑재로 위급 상황 발생 시 즉각 정지하여 돌발 사고를 효과적으로 차단'}</p>
              
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-700">{language === 'en' ? 'Non-powered Mode' : '비전동모드'}</span>
                  <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs rounded-full">OFF</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{language === 'en' ? 'Powered Mode' : '전동모드'}</span>
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">ON</span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <img src="\product\manbo\pd_manbo_tec1.png" alt="비상시 정지기능 이미지" className="w-full max-w-md mx-auto" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">{language === 'en' ? 'Missing Prevention (GPS prototype completed)' : '실종 방지 기능(GPS 프로토 완료)'}</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">{language === 'en' ? 'Real-time monitoring with GPS-based tracking to prevent missing incidents among high-risk groups such as dementia patients' : 'GPS 기반 위치 추적 시스템을 통한 실시간 모니터링으로, 치매 등 고위험군의 실종 사고 예방'}</p>
              
              <div className="bg-blue-50 rounded-lg p-6 flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                   <div className="font-semibold text-blue-900">{language === 'en' ? 'Real-time Tracking' : '실시간 위치 추적'}</div>
                   <div className="text-sm text-blue-700">{language === 'en' ? 'Instant alerts to family/caregivers' : '가족과 보호자에게 실시간 알림'}</div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <img src="\product\manbo\pd_manbo_tec2.jpg" alt="실종방지기능 이미지" className="w-full rounded-lg shadow-md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Timeline */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1C4376] mb-4 sm:mb-6">
              {language === 'en' ? 'Current Development and Product Lineup Commercialization Plan' : '현재 개발 및 제품 라인업 상용화 계획'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#1C4376]">
              {language === 'en' ? '1st prototype production and 1st performance evaluation completed, currently making 2nd prototype, targeting June 2026 launch' : '1차 시제품 제작 및 1차 성능평가 완료, 현재 2차 시제품 제작 중, 2026년 6월 런칭 목표'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border-l-4 border-[#1C4376]">
              <div className="text-[#1C4376] font-bold text-xs sm:text-sm mb-3 sm:mb-4">{language === 'en' ? 'Phase 1 Completed' : '1차 단계 완료'}</div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-3 sm:mb-4">{language === 'en' ? 'Prototype Production and Performance Evaluation' : '시제품 제작 및 성능평가'}</h3>
              <ul className="text-slate-600 space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1C4376] rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span>{language === 'en' ? 'Basic structure design completed' : '기본 구조 설계 완료'}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1C4376] rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span>{language === 'en' ? 'Hybrid system prototype' : '하이브리드 시스템 프로토타입'}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1C4376] rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span>{language === 'en' ? 'Initial user testing' : '초기 사용자 테스트'}</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border-l-4 border-[#BDA191]">
              <div className="text-[#BDA191] font-bold text-xs sm:text-sm mb-3 sm:mb-4">{language === 'en' ? 'Currently in Progress' : '현재 진행중'}</div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-3 sm:mb-4">{language === 'en' ? '2nd Prototype Production' : '2차 시제품 제작'}</h3>
              <ul className="text-slate-600 space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#BDA191] rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span>{language === 'en' ? 'GPS system integration' : 'GPS 시스템 통합'}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#BDA191] rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span>{language === 'en' ? 'Advanced smart control system' : '스마트 제어 시스템 고도화'}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#BDA191] rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span>{language === 'en' ? 'Enhanced safety design' : '안전성 강화 설계'}</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border-l-4 border-[#10B981]">
              <div className="text-[#10B981] font-bold text-xs sm:text-sm mb-3 sm:mb-4">{language === 'en' ? 'June 2026 Target' : '2026년 6월 목표'}</div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-3 sm:mb-4">{language === 'en' ? 'Commercial Launch' : '상용화 런칭'}</h3>
              <ul className="text-slate-600 space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#10B981] rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span>{language === 'en' ? 'Establish mass production system' : '대량 생산 체계 구축'}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#10B981] rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span>{language === 'en' ? 'Open B2B/B2C sales channels' : 'B2B/B2C 판매 채널 오픈'}</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#10B981] rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                  <span>{language === 'en' ? 'Expand into global markets' : '글로벌 시장 진출'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 border border-slate-200">
               <h2 className="text-base sm:text-xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-5">
                 {language === 'en' ? 'Experience a new level of walking assistance' : '혁신적인 보행 보조기구로 새로운 경험을 제공합니다'}
               </h2>
               <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-slate-600 mb-5 sm:mb-7">
                 {language === 'en' ? 'MANBO Walkmate for safe and comfortable walking' : '안전하고 편안한 보행을 위한 만보 워크메이트'}
               </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a 
                  href="/inquiry" 
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-all shadow-lg"
                >
                    <span>{language === 'en' ? 'Product Inquiry' : '제품 문의하기'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 소나버스 스토리 섹션 - 풀 width */}
      <div className="w-full bg-gradient-to-br from-[#f8f6f4] via-[#f0ece9] to-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {language === 'en' ? 'Explore Our Stories' : '우리의 이야기를 만나보세요'}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {language === 'en' ? 'Discover SONAVERSE\'s innovative journey and stories' : '소나버스의 혁신적인 여정과 다양한 이야기를 확인해보세요'}
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
                          {(story.content.ko.thumbnail_url || story.thumbnail_url) ? (
                            <AdaptiveImage
                              src={story.content.ko.thumbnail_url || story.thumbnail_url || '/logo/nonImage_logo.png'}
                              alt={story.content.ko.title}
                              className="w-full h-full group-hover:scale-110 transition-transform duration-700 bg-white"
                            />
                          ) : (
                            <AdaptiveImage
                              src="/images/default-thumbnail.png"
                              alt={story.content.ko.title}
                              className="w-full h-full group-hover:scale-110 transition-transform duration-700 bg-white"
                            />
                          )}
                          
                          {/* 기본 콘텐츠 (이미지가 없을 때) */}
                          {!(story.content.ko.thumbnail_url || story.thumbnail_url) && (
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
                          
                        </div>
                        
                        {/* 콘텐츠 영역 */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-[#bda191] rounded-full"></div>
                            <span className="text-sm text-[#bda191] font-medium">{language === 'en' ? 'SONAVERSE Story' : '소나버스 스토리'}</span>
                          </div>
                          
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-[#bda191] transition-colors duration-300">
                          {story.content[language]?.title || story.content.ko.title}
                          </h3>
                          
                          <div className="flex items-center justify-between">
                            <time className="text-sm text-gray-500">
                               {new Date(story.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
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
                          {(story.content.ko.thumbnail_url || story.thumbnail_url) ? (
                            <AdaptiveImage
                              src={story.content.ko.thumbnail_url || story.thumbnail_url || '/logo/nonImage_logo.png'}
                              alt={story.content.ko.title}
                              className="w-full h-full group-hover:scale-110 transition-transform duration-700 bg-white"
                            />
                          ) : (
                            <AdaptiveImage
                              src="/images/default-thumbnail.png"
                              alt={story.content.ko.title}
                              className="w-full h-full group-hover:scale-110 transition-transform duration-700 bg-white"
                            />
                          )}
                          
                          {/* 기본 콘텐츠 (이미지가 없을 때) */}
                          {!(story.content.ko.thumbnail_url || story.thumbnail_url) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                             <span className="text-sm font-medium">{language === 'ko' ? '소나버스' : 'SONAVERSE'}</span>
                              </div>
                            </div>
                          )}
                          
                        </div>
                        
                        {/* 텍스트 영역 */}
                        <div className="flex-1 flex flex-col px-4 pb-4 pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-[#bda191] rounded-full"></div>
                             <span className="text-xs text-[#bda191] font-medium">{language === 'en' ? 'Story' : '스토리'}</span>
                          </div>
                          
                          <h3 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-[#bda191] transition-colors duration-300 line-clamp-2 leading-tight">
                             {story.content[language]?.title || story.content.ko.title}
                          </h3>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <time className="text-xs text-gray-500">
                               {new Date(story.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
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
                     <span className="mr-3">{language === 'en' ? 'View All' : '전체보기'}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{language === 'en' ? 'Stories are being prepared.' : '스토리가 준비 중입니다.'}</p>
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

export default ManboWalkerPage; 