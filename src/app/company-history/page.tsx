'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import ScrollToTop from '../../components/ScrollToTop';

interface HistoryItem {
  year: string;
  title: string;
  events: string[];
  description: string;
}

interface PressRelease {
  _id: string;
  slug: string;
  press_name: {
    ko: string;
    en: string;
  };
  content: {
    ko: {
      title: string;
      body: string;
      external_link?: string;
    };
    en: {
      title: string;
      body: string;
      external_link?: string;
    };
  };
  created_at: string;
  is_active: boolean;
}

const CompanyHistoryPage: React.FC = () => {
  const { language, isClient } = useLanguage();
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  
  // Mobile sliding states for press releases section
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  

  const companyHistory = {
    ko: [
      {
        year: '2022',
        title: '㈜소나버스 법인 설립',
        events: ['기업부설연구소 설립', '여성기업 인증 취득'],
        description: '시니어 케어 시장 진입과 혁신 기술 개발의 시작'
      },
      {
        year: '2023',
        title: '기술력 검증 및 성장 기반 구축',
        events: ['㈜강원대학교 기술지주회사 출자', 'G-스타트업 예비창업 지원사업 선정', 'LINC 3.0 기술사업화 지원사업 선정', '연구소 기업 승인', '벤처기업 인증 취득'],
        description: '정부 지원 사업 선정과 벤처 생태계 진입'
      },
      {
        year: '2024',
        title: '글로벌 진출 및 품질 인증',
        events: ['ISO 인증 취득(9001/14001)', '2024 여성창업경진대회 이사장상 수상', '강소특구 기술이전사업화 R&D 선정', '창업성장기술개발사업(디딤돌)'],
        description: '국제 표준 인증과 글로벌 파트너십 구축'
      },
      {
        year: '2025',
        title: '제품 상용화 원년',
        events: ['신용보증기금 Startup-NEST 17기 선정', '창업중심대학 선정', '리틀펭귄 보증 확보', '글로벌 MOU 체결', '보듬 기저귀 런칭', '크라우드 펀딩 진행', '알리바바 입점'],
        description: '첫 번째 제품 출시와 본격적인 시장 진입'
      },
      {
        year: '2026',
        title: '하이브리드 워크메이트 출시',
        events: ['만보 런칭 목표(2026.6)'],
        description: '혁신적인 보행 보조 기술의 상용화 달성'
      }
    ],
    en: [
      {
        year: '2022',
        title: 'Sonaverse Co., Ltd. Establishment',
        events: ['Corporate R&D Institute Establishment', 'Women-owned Business Certification'],
        description: 'Entry into senior care market and beginning of innovative technology development'
      },
      {
        year: '2023',
        title: 'Technology Validation and Growth Foundation',
        events: ['Kangwon National University Technology Holding Investment', 'G-Startup Pre-startup Support Program Selection', 'LINC 3.0 Technology Commercialization Support', 'Research Institute Company Approval', 'Venture Company Certification'],
        description: 'Government support program selection and venture ecosystem entry'
      },
      {
        year: '2024',
        title: 'Global Expansion and Quality Certification',
        events: ['ISO Certification (9001/14001)', '2024 Women Entrepreneurship Contest Chairman Award', 'Technology Transfer R&D Selection', 'Startup Growth Technology Development Project (Stepping Stone)'],
        description: 'International standard certification and global partnership establishment'
      },
      {
        year: '2025',
        title: 'Product Commercialization Year',
        events: ['Korea Credit Guarantee Fund Startup-NEST 17th Selection', 'Startup-Centered University Selection', 'Little Penguin Guarantee Secured', 'Global MOU Signing', 'BO DUME Diaper Launch', 'Crowdfunding Campaign', 'Alibaba Platform Entry'],
        description: 'First product launch and full-scale market entry'
      },
      {
        year: '2026',
        title: 'Hybrid Walkmate Launch',
        events: ['Manbo Launch Target (June 2026)'],
        description: 'Commercialization of innovative walking assistance technology'
      }
    ]
  };

  const history = companyHistory[language as keyof typeof companyHistory];

  // 년도별 그라데이션 색상 계산 함수
  const getYearColor = (index: number, total: number) => {
    // 가장 마지막 년도(최신)가 가장 진한 #0B3877
    // 가장 첫 번째 년도(오래된)가 가장 연한 색상
    const baseColor = 0x0B3877;
    const r = (baseColor >> 16) & 0xFF; // 11
    const g = (baseColor >> 8) & 0xFF;  // 56
    const b = baseColor & 0xFF;         // 119
    
    // 인덱스를 역순으로 계산 (마지막이 1.0, 첫번째가 0.2 시작)
    const intensity = 0.2 + (0.8 * (index / (total - 1)));
    
    // RGB 각각에 intensity 적용
    const newR = Math.round(r + (255 - r) * (1 - intensity));
    const newG = Math.round(g + (255 - g) * (1 - intensity));
    const newB = Math.round(b + (255 - b) * (1 - intensity));
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  const getPressReleases = async () => {
    try {
      const response = await fetch('/api/press?active=true&pageSize=3', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch press releases');
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching press releases:', error);
      return [];
    }
  };

  React.useEffect(() => {
    const fetchPressReleases = async () => {
      const fetchedPressReleases = await getPressReleases();
      setPressReleases(fetchedPressReleases);
    };
    
    fetchPressReleases();
  }, []);

  // Auto-sliding functionality for press releases
  React.useEffect(() => {
    if (pressReleases.length <= 2 || isHovered || isDragging) return;

    const maxSlide = Math.max(0, pressReleases.length - 2);
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev >= maxSlide) {
          return 0;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [pressReleases.length, isHovered, isDragging]);

  // Touch/mouse handlers for press releases sliding
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
    const maxSlide = Math.max(0, pressReleases.length - 2);
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  return (
    <>
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* 헤더 */}
          <div className="text-center mb-16">
            <h1 className="text-xl md:text-5xl font-bold mb-6 text-slate-800">
              {language === 'ko' ? '기업 연혁' : 'Company History'}
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {language === 'ko' 
                ? '2022년 설립 이후 지속적인 성장을 이어가고 있습니다.'
                : 'We have been growing continuously since our establishment in 2022.'
              }
            </p>
          </div>
          
          {/* 연혁 섹션 */}
          <div className="relative mb-8">
            {/* 세로 연결선 - 반응형 위치 조정 */}
            <div className="absolute left-1.5 md:left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            
            <div className="space-y-4 md:space-y-12">
              {history.map((item: HistoryItem, idx: number) => (
                <div 
                  key={idx} 
                  className="relative transform transition-all duration-1000"
                >
                  {/* 년도 표시 - 반응형 위치와 크기 조정 */}
                  <div 
                    className="absolute left-0 md:left-0 w-3 h-3 md:w-12 md:h-12 rounded-sm md:rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: getYearColor(idx, history.length) }}
                  >
                    <span className="text-white font-bold text-[6px] md:text-sm">{item.year}</span>
                  </div>
                  
                  {/* 내용 카드 - 반응형 여백 조정 */}
                  <div className="ml-5 md:ml-20">
                    <div className="bg-slate-50 rounded-lg md:rounded-3xl p-2 md:p-8 hover:bg-white hover:shadow-lg transition-all duration-500 border border-slate-100">
                      <div className="mb-2 md:mb-6">
                        <h4 className="text-sm md:text-2xl font-bold text-slate-900 leading-tight">
                          {item.title}
                        </h4>
                      </div>
                      
                      <p className="text-slate-600 mb-2 md:mb-6 leading-relaxed text-[10px] md:text-base">
                        {item.description}
                      </p>
                      
                      {/* 주요 이벤트 - 모바일에서는 1열, 데스크톱에서는 2열 */}
                      {item.events && Array.isArray(item.events) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 md:gap-4 auto-rows-fr">
                          {item.events.map((event: string, eventIdx: number) => (
                            <div key={eventIdx} className="flex items-start p-1.5 md:p-4 bg-white rounded md:rounded-xl shadow-sm h-full min-h-[1.5rem] md:min-h-[3rem]">
                    <div 
                      className="w-0.5 h-0.5 md:w-2 md:h-2 rounded-full mt-[0.25rem] md:mt-[0.5rem] mr-1 md:mr-3 flex-shrink-0"
                      style={{ backgroundColor: getYearColor(idx, history.length) }}
                    ></div>
                              <span className="text-[8px] md:text-sm text-slate-700 leading-relaxed flex-1 pt-0.5">{event}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 미래 포인트 - 반응형 조정 */}
            <div className="relative mt-6 md:mt-12">
              <div className="absolute left-0 md:left-0 w-3 h-3 md:w-12 md:h-12 bg-slate-300 rounded-sm md:rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-[6px] md:text-sm">∞</span>
              </div>
              <div className="ml-5 md:ml-20">
                <div className="bg-gradient-to-r from-[#bda191] to-[#a68b7a] rounded-lg md:rounded-3xl p-2 md:p-8 text-white">
                  <h4 className="text-sm md:text-2xl font-bold mb-1 md:mb-4">
                    {language === 'ko' ? '계속되는 여정' : 'Continuing Journey'}
                  </h4>
                  <p className="text-[10px] md:text-lg opacity-90 leading-relaxed">
                    {language === 'ko' 
                      ? '시니어 라이프 혁신을 위한 소나버스의 도전은 계속됩니다.'
                      : 'SONAVERSE\'s challenge to innovate senior life continues.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 언론보도 섹션 - 풀 width */}
      <div className="w-full bg-gradient-to-br from-[#f8f6f4] via-[#f0ece9] to-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {language === 'ko' ? '언론보도' : 'Press Releases'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'ko' 
                ? '소나버스의 혁신적인 여정을 언론을 통해 만나보세요'
                : 'Discover SONAVERSE\'s innovative journey through the media'
              }
            </p>
          </div>

          {pressReleases.length > 0 ? (
            <div className="space-y-12">
              {/* 데스크톱 그리드 */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                {pressReleases.slice(0, 3).map((press) => (
                  <article key={press._id} className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <Link href={`/press/${press.slug}`}>
                      <div className="relative">
                        {/* 썸네일 이미지 영역 */}
                        <div className="h-48 bg-gradient-to-br from-[#bda191] via-[#a68b7a] to-[#8f7a6b] relative overflow-hidden">
                          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                </svg>
                              </div>
                              <span className="text-lg font-semibold">{press.press_name[language] || press.press_name.ko}</span>
                            </div>
                          </div>
                          
                          {/* 호버 오버레이 */}
                          <div className="absolute inset-0 bg-[#bda191] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        </div>
                        
                        {/* 콘텐츠 영역 */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-[#bda191] rounded-full"></div>
                            <span className="text-sm text-[#bda191] font-medium">
                              {language === 'ko' ? '언론보도' : 'Press Release'}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-[#bda191] transition-colors duration-300">
                            {press.content[language]?.title || press.content.ko.title}
                          </h3>
                          
                          <div className="flex items-center justify-between">
                            <time className="text-sm text-gray-500">
                              {new Date(press.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
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
                  {pressReleases.map((press) => (
                    <div 
                      key={press._id}
                      className="flex-none w-1/2 px-2"
                    >
                      <div
                        onClick={() => window.location.href = `/press/${press.slug}`}
                        className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer h-full"
                      >
                        {/* 이미지 영역 */}
                        <div className="relative h-32 bg-gradient-to-br from-[#bda191] via-[#a68b7a] to-[#8f7a6b] overflow-hidden">
                          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                </svg>
                              </div>
                              <span className="text-sm font-medium">{press.press_name[language] || press.press_name.ko}</span>
                            </div>
                          </div>
                          
                          {/* 호버 오버레이 */}
                          <div className="absolute inset-0 bg-[#bda191] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        </div>
                        
                        {/* 텍스트 영역 */}
                        <div className="flex-1 flex flex-col px-4 pb-4 pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-[#bda191] rounded-full"></div>
                            <span className="text-xs text-[#bda191] font-medium">
                              {language === 'ko' ? '언론보도' : 'Press'}
                            </span>
                          </div>
                          
                          <h5 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-[#bda191] transition-colors duration-300 line-clamp-2 leading-tight">
                            {press.content[language]?.title || press.content.ko.title}
                          </h5>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <time className="text-xs text-gray-500">
                              {new Date(press.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
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
                {pressReleases.length > 2 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: Math.max(0, pressReleases.length - 1) }).map((_, index) => (
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
                <Link href="/press">
                  <button className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-[#bda191] to-[#a68b7a] text-white font-semibold rounded-2xl hover:from-[#a68b7a] hover:to-[#8f7a6b] transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                    <span className="mr-3">{language === 'ko' ? '전체보기' : 'View All'}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {language === 'ko' ? '언론보도가 준비 중입니다.' : 'Press releases are being prepared.'}
              </p>
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
      
      {/* 맨 위로 스크롤 버튼 */}
      <ScrollToTop />
    </>
  );
};
export default CompanyHistoryPage; 