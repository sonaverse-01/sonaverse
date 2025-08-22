'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import ScrollToTop from '../../components/ScrollToTop';

interface SonaverseStory {
  _id: string;
  slug: string;
  thumbnail_url?: string;
  thumbnail?: string; // API에서 추가로 제공하는 필드
  category?: string;
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


export default function SonaverseStoryPage() {
  const { language, isClient } = useLanguage();
  const [stories, setStories] = useState<SonaverseStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<SonaverseStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(4); // 메인 1개 + 일반 3개
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  
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


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedStories = await getSonaverseStories();
      setStories(fetchedStories);
      setFilteredStories(fetchedStories);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // 카테고리 필터링 기능
  useEffect(() => {
    if (selectedCategory === '전체') {
      setFilteredStories(stories);
    } else {
      const filtered = stories.filter(story => story.category === selectedCategory);
      setFilteredStories(filtered);
    }
    setDisplayCount(4); // 필터링 시 display count 리셋
    setIsExpanded(false);
  }, [selectedCategory, stories]);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 6);
    setIsExpanded(true);
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
        <div className="text-center mb-16">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-10 mt-8 md:mt-16">
            {language === 'en' ? 'Sonaverse Story' : '소나버스 스토리'}
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl text-gray-600 font-medium mb-12">
            <span className="hidden md:inline">
              {language === 'en' ? 'From product development stories to useful welfare/health information!' : '소나버스 제품의 개발 스토리부터 유용한 복지/건강 정보까지!'}
            </span>
            <span className="md:hidden whitespace-pre-line">
              {language === 'en' ? 'From product development stories to useful welfare/health information!' : '소나버스 제품의 개발 스토리부터\n유용한 복지/건강 정보까지!'}
            </span>
          </h2>
          
          {/* 카테고리 필터 버튼 */}
          {/* 데스크톱: 기존 flex-wrap 레이아웃 */}
          <div className="hidden md:flex flex-wrap justify-center gap-4 mb-10">
            {['전체', '제품스토리', '사용법', '건강정보', '복지정보'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-[#bda191] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language === 'en' 
                  ? category === '전체' ? 'All' 
                    : category === '제품스토리' ? 'Product Stories'
                    : category === '사용법' ? 'How to Use'
                    : category === '건강정보' ? 'Health Info'
                    : category === '복지정보' ? 'Welfare Info'
                    : category
                  : category
                }
              </button>
            ))}
          </div>
          
          {/* 모바일: 슬라이딩 레이아웃 */}
          <div className="md:hidden mb-10">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 px-4 min-w-max">
                {['전체', '제품스토리', '사용법', '건강정보', '복지정보'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-[#bda191] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {language === 'en' 
                      ? category === '전체' ? 'All' 
                        : category === '제품스토리' ? 'Product Stories'
                        : category === '사용법' ? 'How to Use'
                        : category === '건강정보' ? 'Health Info'
                        : category === '복지정보' ? 'Welfare Info'
                        : category
                      : category
                    }
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 스토리 그리드 */}
        {filteredStories.length > 0 ? (
          <div className="space-y-12">
            {/* 메인 스토리 (대형 카드) */}
            {filteredStories.filter((story: SonaverseStory) => story.is_main).slice(0, 1).map((story: SonaverseStory) => (
              <article key={story._id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="flex flex-col lg:flex-row">
                  {/* 이미지 영역 */}
                  <div className="lg:w-1/2">
                    <Link href={`/sonaverse-story/${story.slug}`}>
                      <div className="relative h-64 lg:h-full">
                        {story.thumbnail ? (
                          <img
                            src={story.thumbnail}
                            alt={story.content.ko.title}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-700 bg-white"
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
                          <img
                            src="/images/default-thumbnail.png"
                            alt={story.content.ko.title}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-700 bg-white"
                          />
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
              {filteredStories.filter((story: SonaverseStory) => !story.is_main).slice(0, displayCount - 1).map((story: SonaverseStory) => (
              <article key={story._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <Link href={`/sonaverse-story/${story.slug}`}>
                  <div className="relative">
                    {/* 썸네일 이미지 또는 YouTube 썸네일 */}
                    {story.thumbnail_url ? (
                      <img
                        src={story.thumbnail_url}
                        alt={story.content.ko.title}
                        className="w-full h-48 object-contain bg-white"
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
                      <img
                        src="/images/default-thumbnail.png"
                        alt={story.content.ko.title}
                        className="w-full h-48 object-contain bg-white"
                      />
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
              {filteredStories.filter((story: SonaverseStory) => !story.is_main).slice(0, displayCount - 1).map((story: SonaverseStory) => (
                <article key={story._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-24">
                  <Link href={`/sonaverse-story/${story.slug}`}>
                    <div className="flex items-start h-full">
                      {/* 왼쪽 썸네일 - 고정 높이 */}
                      <div className="w-24 h-24 bg-gray-200 flex-shrink-0 rounded-l-2xl relative overflow-hidden">
                        {story.thumbnail ? (
                          <img
                            src={story.thumbnail}
                            alt={story.content.ko.title}
                            className="w-full h-full object-contain bg-white"
                          />
                        ) : story.youtube_url ? (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                        ) : (
                          <img
                            src="/images/default-thumbnail.png"
                            alt={story.content.ko.title}
                            className="w-full h-full object-contain bg-white"
                          />
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
            {filteredStories.filter((story: SonaverseStory) => !story.is_main).length > displayCount - 1 && (
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

      
      {/* CSS for line-clamp and scrollbar hide */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* 맨 위로 스크롤 버튼 */}
      <ScrollToTop />
    </>
  );
}