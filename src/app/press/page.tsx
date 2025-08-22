'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import ScrollToTop from '../../components/ScrollToTop';

interface PressRelease {
  _id: string;
  slug: string;
  press_name: {
    ko: string;
    en: string;
  };
  thumbnail?: string;
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

const PressPage: React.FC = () => {
  const { language, isClient } = useLanguage();
  const [pressList, setPressList] = useState<PressRelease[]>([]);
  const [displayCount, setDisplayCount] = useState(6);
  const [loading, setLoading] = useState(false);
  

  const fetchAllPress = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/press?active=true&lang=${language}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch press releases');
      }
      
      const data = await response.json();
      setPressList(data.results || []);
    } catch (error) {
      console.error('Error fetching press releases:', error);
      setPressList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPress();
  }, [language]);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 3);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{language === 'en' ? 'Loading press releases...' : '언론보도를 불러오는 중...'}</p>
        </div>
      </div>
    );
  }

  // 하이드레이션 완료 전에는 로딩 상태 표시
  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="text-center mb-16">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-10 mt-8 md:mt-16">
          {language === 'en' ? 'Press Releases' : '언론보도'}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto whitespace-pre-line">
          {language === 'ko' ? '소나버스의 혁신적인 여정을\n언론을 통해 만나보세요' : 'Discover SONAVERSE\'s innovative journey through the media'}
        </p>
      </div>

      {/* 언론보도 그리드 - 모바일 최적화 */}
      {pressList.length > 0 ? (
        <div className="space-y-12">
          {/* 데스크톱: 3열 그리드, 모바일: 1열 리스트 */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pressList.slice(0, displayCount).map((press) => (
              <article key={press._id} className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <Link href={`/press/${press.slug}`}>
                  <div className="relative">
                    {/* 썸네일 이미지 영역 */}
                    <div className="h-48 relative overflow-hidden">
                      {press.thumbnail ? (
                        <img 
                          src={press.thumbnail} 
                          alt={press.content[language]?.title || press.content.ko.title}
                          className="w-full h-full object-contain bg-white"
                        />
                      ) : (
                        <img
                          src="/images/default-thumbnail.png"
                          alt={press.content[language]?.title || press.content.ko.title}
                          className="w-full h-full object-contain bg-white"
                        />
                      )}
                    </div>
                    
                    {/* 콘텐츠 영역 */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-[#bda191] rounded-full"></div>
                        <span className="text-sm text-[#bda191] font-medium">{language === 'en' ? 'Press' : '언론보도'}</span>
                      </div>
                      
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-[#bda191] transition-colors duration-300">
                        {press.content[language]?.title || press.content.ko.title}
                      </h2>
                      
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

          {/* 모바일: 컴팩트한 리스트 형태 */}
          <div className="md:hidden space-y-4">
            {pressList.slice(0, displayCount).map((press) => (
              <article key={press._id} className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                <Link href={`/press/${press.slug}`}>
                  <div className="flex h-full">
                    {/* 왼쪽 썸네일 */}
                    <div className="w-24 flex-shrink-0 rounded-l-2xl relative overflow-hidden">
                      {press.thumbnail ? (
                        <img 
                          src={press.thumbnail} 
                          alt={press.content[language]?.title || press.content.ko.title}
                          className="w-full h-full object-contain bg-white"
                        />
                      ) : (
                        <img
                          src="/images/default-thumbnail.png"
                          alt={press.content[language]?.title || press.content.ko.title}
                          className="w-full h-full object-contain bg-white"
                        />
                      )}
                    </div>
                    
                    {/* 오른쪽 콘텐츠 */}
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-[#bda191] rounded-full"></div>
                        <span className="text-xs text-[#bda191] font-medium">{language === 'en' ? 'Press' : '언론보도'}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{press.press_name[language] || press.press_name.ko}</span>
                      </div>
                      
                      <h2 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#bda191] transition-colors duration-300">
                        {press.content[language]?.title || press.content.ko.title}
                      </h2>
                      
                      <div className="flex items-center justify-between">
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
                </Link>
              </article>
            ))}
          </div>
          
          {/* 더보기 버튼 */}
          {pressList.length > displayCount && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center px-8 py-4 bg-gray-800 text-white font-semibold rounded-2xl hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
{language === 'en' ? 'Load More Press' : '더 많은 언론보도 보기'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">{language === 'en' ? 'No press releases available yet.' : '아직 언론보도가 없습니다.'}</p>
        </div>
      )}
      
      {/* 맨 위로 스크롤 버튼 */}
      <ScrollToTop />
    </div>
  );
};

export default PressPage;
 