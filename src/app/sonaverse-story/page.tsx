'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import ScrollToTop from '../../components/ScrollToTop';

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

export default function SonaverseStoryPage() {
  const { language, isClient } = useLanguage();
  const [stories, setStories] = useState<SonaverseStory[]>([]);
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(4); // 메인 1개 + 일반 3개
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Mobile sliding states for press releases section
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // LanguageContext의 language 상태만 사용 (SSR 일관성 보장)

  const getSonaverseStories = async () => {
    try {
      const response = await fetch('/api/sonaverse-story?published=true', {
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [fetchedStories, fetchedPressReleases] = await Promise.all([
        getSonaverseStories(),
        getPressReleases()
      ]);
      setStories(fetchedStories);
      setPressReleases(fetchedPressReleases);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 6);
    setIsExpanded(true);
  };

  // Auto-sliding functionality for press releases
  useEffect(() => {
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{language === 'en' ? 'Loading stories...' : '스토리를 불러오는 중...'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {language === 'en' ? 'Sonaverse Story' : '소나버스 스토리'}
          </h1>
        </div>

        {/* 스토리 그리드 */}
        {stories.length > 0 ? (
          <div className="space-y-12">
            {/* 메인 스토리 (대형 카드) */}
            {stories.filter((story: SonaverseStory) => story.is_main).slice(0, 1).map((story: SonaverseStory) => (
              <article key={story._id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="flex flex-col lg:flex-row">
                  {/* 이미지 영역 */}
                  <div className="lg:w-1/2">
                    <Link href={`/sonaverse-story/${story.slug}`}>
                      <div className="relative h-64 lg:h-full">
                        {story.thumbnail_url ? (
                          <img
                            src={story.thumbnail_url}
                            alt={story.content.ko.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                          />
                        ) : story.youtube_url ? (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <div className="text-gray-600 text-center">
                              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                              <p className="text-lg">YouTube Video</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-300"></div>
                        )}
                        
                        
                        {/* YouTube 아이콘 */}
                        {story.youtube_url && (
                          <div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                  
                  {/* 콘텐츠 영역 */}
                  <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <Link href={`/sonaverse-story/${story.slug}`}>
                      <div className="space-y-4">
                        <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight hover:text-blue-600 transition-colors duration-300">
                          {story.content[language]?.title || story.content.ko.title}
                        </h2>
                        {(story.content[language]?.subtitle || story.content.ko.subtitle) && (
                          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                            {story.content[language]?.subtitle || story.content.ko.subtitle}
                          </p>
                        )}
                        
                        <div className="pt-6">
                          <time className="text-sm text-gray-500">
                            {new Date(story.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            
            {/* 일반 스토리들 - 데스크톱: 그리드, 모바일: 리스트 */}
            {/* 데스크톱 그리드 레이아웃 */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.filter((story: SonaverseStory) => !story.is_main).slice(0, displayCount - 1).map((story: SonaverseStory) => (
              <article key={story._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <Link href={`/sonaverse-story/${story.slug}`}>
                  <div className="relative">
                    {/* 썸네일 이미지 또는 YouTube 썸네일 */}
                    {story.thumbnail_url ? (
                      <img
                        src={story.thumbnail_url}
                        alt={story.content.ko.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : story.youtube_url ? (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <div className="text-gray-600 text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <p className="text-sm">YouTube Video</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-300"></div>
                    )}
                    
                    {/* YouTube 아이콘 오버레이 */}
                    {story.youtube_url && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {story.content[language]?.title || story.content.ko.title}
                    </h2>
                    {(story.content[language]?.subtitle || story.content.ko.subtitle) && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {story.content[language]?.subtitle || story.content.ko.subtitle}
                      </p>
                    )}
                    
                    <div>
                      <time className="text-sm text-gray-500">
                        {new Date(story.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
            </div>

            {/* 모바일 리스트 레이아웃 - 이미지와 카드 높이 일치 */}
            <div className="md:hidden space-y-4">
              {stories.filter((story: SonaverseStory) => !story.is_main).slice(0, displayCount - 1).map((story: SonaverseStory) => (
                <article key={story._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-24">
                  <Link href={`/sonaverse-story/${story.slug}`}>
                    <div className="flex items-start h-full">
                      {/* 왼쪽 썸네일 - 고정 높이 */}
                      <div className="w-24 h-24 bg-gray-200 flex-shrink-0 rounded-l-2xl relative overflow-hidden">
                        {story.thumbnail_url ? (
                          <img
                            src={story.thumbnail_url}
                            alt={story.content.ko.title}
                            className="w-full h-full object-cover"
                          />
                        ) : story.youtube_url ? (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-300"></div>
                        )}
                        
                        {/* YouTube 아이콘 오버레이 */}
                        {story.youtube_url && (
                          <div className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* 오른쪽 콘텐츠 - 카드 높이에 맞춰 조정 */}
                      <div className="flex-1 p-4 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                            <span className="text-xs text-rose-500 font-medium">{language === 'en' ? 'Story' : '스토리'}</span>
                          </div>
                          
                          <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                            {story.content[language]?.title || story.content.ko.title}
                          </h2>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <time className="text-xs text-gray-500">
                            {new Date(story.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </time>
                          <div className="w-4 h-4 text-gray-400 hover:text-rose-500 transition-colors duration-300">
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
            
            {/* 더보기 버튼 */}
            {stories.filter((story: SonaverseStory) => !story.is_main).length > displayCount - 1 && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center px-8 py-4 bg-gray-800 text-white font-semibold rounded-2xl hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
{language === 'en' ? 'More Stories' : '더 많은 스토리 보기'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{language === 'en' ? 'No stories available yet.' : '아직 스토리가 없습니다.'}</p>
          </div>
        )}
      </div>

      {/* 언론보도 섹션 - 풀 width */}
      <div className="w-full bg-gray-50 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {language === 'en' ? 'Press Releases' : '언론보도'}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'ko' ? '소나버스의 혁신적인 여정을 언론을 통해 만나보세요' : 'Discover SONAVERSE\'s innovative journey through the media'}
            </p>
          </div>

          {pressReleases.length > 0 ? (
            <div className="space-y-12">
              {/* 데스크톱 그리드 레이아웃 */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pressReleases.slice(0, 3).map((press) => (
                  <article key={press._id} className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <Link href={`/press/${press.slug}`}>
                      <div className="relative">
                        {/* 썸네일 이미지 영역 */}
                        <div className="h-48 relative overflow-hidden">
                          {press.thumbnail ? (
                            <>
                              <img 
                                src={press.thumbnail} 
                                alt={press.content[language]?.title || press.content.ko.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                            </>
                          ) : (
                            <>
                              <div className="w-full h-full bg-gradient-to-br from-[#bda191] via-[#a68b7a] to-[#8f7a6b]"></div>
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
                            </>
                          )}
                          
                          {/* 호버 오버레이 */}
                          <div className="absolute inset-0 bg-[#bda191] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        </div>
                        
                        {/* 콘텐츠 영역 */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-[#bda191] rounded-full"></div>
                            <span className="text-sm text-[#bda191] font-medium">{language === 'en' ? 'Press' : '언론보도'}</span>
                          </div>
                          
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-[#bda191] transition-colors duration-300">
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
                className="md:hidden overflow-hidden"
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
                        <div className="relative h-32 flex-shrink-0 overflow-hidden">
                          {press.thumbnail ? (
                            <>
                              <img 
                                src={press.thumbnail} 
                                alt={press.content[language]?.title || press.content.ko.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                            </>
                          ) : (
                            <>
                              <div className="w-full h-full bg-gradient-to-br from-[#bda191] via-[#a68b7a] to-[#8f7a6b]"></div>
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
                            </>
                          )}
                          <div className="absolute inset-0 bg-[#bda191] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        </div>
                        
                        {/* 텍스트 영역 */}
                        <div className="flex-1 flex flex-col px-4 pb-4 pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-[#bda191] rounded-full"></div>
                            <span className="text-xs text-[#bda191] font-medium">{language === 'en' ? 'Press' : '언론보도'}</span>
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
                  <button className="inline-flex items-center px-10 py-4 bg-gray-800 text-white font-semibold rounded-2xl hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
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
              <p className="text-gray-500 text-lg">{language === 'en' ? 'Press releases are in preparation.' : '언론보도가 준비 중입니다.'}</p>
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
}