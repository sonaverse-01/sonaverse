'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';

interface BlogPost {
  _id: string;
  slug: string;
  content: {
    ko?: {
      title: string;
      subtitle: string;
      thumbnail_url: string;
    };
    en?: {
      title: string;
      subtitle: string;
      thumbnail_url: string;
    };
  };
  created_at: string;
  tags: string[];
}

interface RecommendedPostsProps {
  currentSlug: string;
}

const RecommendedPosts: React.FC<RecommendedPostsProps> = ({ currentSlug }) => {
  const { language, isClient } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mobile sliding states - matching main page implementation
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const fetchRandomPosts = async () => {
    try {
      const response = await fetch(`/api/sonaverse-story?limit=10&published=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch random posts');
      }
      const data = await response.json();
      const filteredPosts = (data.results || []).filter((post: BlogPost) => post.slug !== currentSlug).slice(0, 8);
      setPosts(filteredPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommended posts:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomPosts();
  }, [currentSlug]);

  // Auto-sliding functionality - matching main page implementation
  useEffect(() => {
    if (posts.length <= 2 || isHovered || isDragging) return;

    const maxSlide = Math.max(0, posts.length - 2); // Show 2 cards at a time
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev >= maxSlide) {
          return 0;
        }
        return prev + 1;
      });
    }, 3000); // 3 seconds auto-slide

    return () => clearInterval(interval);
  }, [posts.length, isHovered, isDragging]);

  // Touch/mouse handlers - matching main page implementation
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
    const maxSlide = Math.max(0, posts.length - 2);
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-[#f8f6f4] via-[#f0ece9] to-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bda191] mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {language === 'ko' ? '게시물을 불러오는 중...' : 'Loading posts...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-br from-[#f8f6f4] via-[#f0ece9] to-stone-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {language === 'ko' ? '다른 이야기가 궁금하시다면?' : 'Curious About Other Stories?'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {language === 'ko' ? '소나버스의 다양한 이야기를 만나보세요' : 'Discover various stories from SONAVERSE'}
          </p>
        </div>

        {/* 데스크톱 그리드 */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 mb-12">
          {posts.slice(0, 3).map((post) => {
            const content = post.content?.[language as keyof typeof post.content] || post.content?.ko || post.content?.en;
            if (!content) return null;

            return (
              <Link
                key={post._id}
                href={`/sonaverse-story/${post.slug}`}
                className="group block bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* 이미지 */}
                <div className="relative h-48 bg-gradient-to-br from-[#bda191] via-[#a68b7a] to-[#8f7a6b] overflow-hidden">
                  {content.thumbnail_url ? (
                    <img
                      src={content.thumbnail_url}
                      alt={content.title}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 bg-white"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = '/images/default-thumbnail.png'; 
                      }}
                    />
                  ) : (
                    <img
                      src="/images/default-thumbnail.png"
                      alt={content.title}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 bg-white"
                    />
                  )}
                  
                  {/* 기본 콘텐츠 (이미지가 없을 때) */}
                  {!content.thumbnail_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-lg font-semibold">SONAVERSE Story</span>
                      </div>
                    </div>
                  )}
                  
                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-[#bda191] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>

                {/* 콘텐츠 */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-[#bda191] rounded-full"></div>
                    <span className="text-sm text-[#bda191] font-medium">
                      {language === 'ko' ? '소나버스 스토리' : 'SONAVERSE Story'}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-4 line-clamp-2 group-hover:text-[#bda191] transition-colors duration-300 leading-tight">
                    {content.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <time className="text-gray-500 text-sm">
                      {new Date(post.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
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
              </Link>
            );
          })}
        </div>

        {/* 모바일/태블릿 슬라이딩 - 메인 페이지와 동일한 방식 */}
        <div 
          className="lg:hidden overflow-hidden mb-12"
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
            {posts.map((post) => {
              const content = post.content?.[language as keyof typeof post.content] || post.content?.ko || post.content?.en;
              if (!content) return null;
              
              return (
                <div 
                  key={post._id}
                  className="flex-none w-1/2 px-2"
                >
                  <div
                    onClick={() => window.location.href = `/sonaverse-story/${post.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer h-full"
                  >
                    {/* 이미지 영역 */}
                    <div className="relative h-32 bg-gradient-to-br from-[#bda191] via-[#a68b7a] to-[#8f7a6b] overflow-hidden">
                      {content.thumbnail_url ? (
                        <img
                          src={content.thumbnail_url}
                          alt={content.title}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 bg-white"
                          onError={(e) => { 
                            (e.target as HTMLImageElement).src = '/images/default-thumbnail.png'; 
                          }}
                        />
                      ) : (
                        <img
                      src="/images/default-thumbnail.png"
                      alt={content.title}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 bg-white"
                    />
                      )}
                      
                      {/* 기본 콘텐츠 (이미지가 없을 때) */}
                      {!content.thumbnail_url && (
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
                        <span className="text-xs text-[#bda191] font-medium">
                          {language === 'ko' ? '스토리' : 'Story'}
                        </span>
                      </div>
                      
                      <h5 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-[#bda191] transition-colors duration-300 line-clamp-2 leading-tight">
                        {content.title}
                      </h5>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <time className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
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
              );
            })}
          </div>

          {/* 슬라이딩 인디케이터 */}
          {posts.length > 2 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.max(0, posts.length - 1) }).map((_, index) => (
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

        {/* "더 많은 스토리 보기" 버튼 */}
        <div className="text-center">
          <Link
            href="/sonaverse-story"
            className="inline-flex items-center px-8 py-4 bg-slate-800 text-white rounded-2xl font-semibold hover:bg-slate-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="mr-3">
              {language === 'ko' ? '더 많은 스토리 보기' : 'View More Stories'}
            </span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
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
    </div>
  );
};

export default RecommendedPosts;