'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import RecommendedPosts from '@/components/RecommendedPosts';
import '@/app/i18n';

interface SonaverseStoryContent {
  title: string;
  subtitle?: string;
  body: string;
  thumbnail_url?: string;
}

interface SonaverseStory {
  _id: string;
  slug: string;
  youtube_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_published: boolean;
  content: {
    ko: SonaverseStoryContent;
    en: SonaverseStoryContent;
  };
}

function getLocalizedContent(
  content: { ko: SonaverseStoryContent; en: SonaverseStoryContent },
  lang: string
): SonaverseStoryContent {
  return content?.[lang as keyof typeof content] || content?.ko;
}

export default function ClientStoryDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const { i18n, t } = useTranslation();

  const [story, setStory] = useState<SonaverseStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentContent, setCurrentContent] = useState<SonaverseStoryContent | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/sonaverse-story/${slug}`);
        if (!response.ok) throw new Error('Story not found');
        const data = await response.json();
        setStory(data.story);
      } catch (error) {
        console.error('Error fetching story:', error);
        alert(i18n.language === 'en' ? 'Story not found.' : '스토리를 찾을 수 없습니다.');
        router.push('/sonaverse-story');
      } finally {
        setLoading(false);
      }
    };
    if (slug && mounted) fetchStory();
  }, [slug, router, i18n.language, mounted]);

  useEffect(() => {
    if (story?.content) {
      setCurrentContent(getLocalizedContent(story.content, i18n.language));
    }
  }, [story, i18n.language]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {mounted && i18n.language === 'en' ? 'Loading story...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!story || !story.content || !currentContent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">
            {mounted && i18n.language === 'en' ? 'Story not found.' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // YouTube URL을 embed URL로 변환
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    if (url.includes('/embed/')) {
      const separator = url.includes('?') ? '&' : '?';
      return url.includes('autoplay') ? url : `${url}${separator}autoplay=1&mute=1`;
    }
    
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=1`;
    }
    
    return url;
  };

  const embedUrl = story.youtube_url ? getYouTubeEmbedUrl(story.youtube_url) : '';

  // HTML 콘텐츠 정리
  const cleanHtmlContent = (html: string) => {
    if (!html) return '';
    
    return html
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      .replace(/<main[^>]*>/gi, '')
      .replace(/<\/main>/gi, '')
      .trim();
  };

  const cleanedContent = cleanHtmlContent(currentContent.body || '');

  // JSON-LD 구조화된 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: currentContent.title || 'Story',
    description: currentContent.subtitle || currentContent.title || 'SONAVERSE Story',
    image: currentContent.thumbnail_url || 'https://sonaverse.kr/logo/symbol_logo.png',
    datePublished: story.created_at,
    dateModified: story.updated_at,
    author: {
      '@type': 'Organization',
      name: 'SONAVERSE',
      url: 'https://sonaverse.kr'
    },
    publisher: {
      '@type': 'Organization',
      name: 'SONAVERSE',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sonaverse.kr/logo/symbol_logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://sonaverse.kr/sonaverse-story/${story.slug}`
    },
    url: `https://sonaverse.kr/sonaverse-story/${story.slug}`,
    keywords: ['소나버스', '시니어 케어', '헬스케어', currentContent.title].join(', '),
    articleBody: currentContent.body?.replace(/<[^>]*>/g, '') || ''
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 뒤로가기 / 목록으로 */}
        <div className="mb-6">
          <a 
            href="/sonaverse-story" 
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:border-gray-400 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            {i18n.language === 'en' ? 'Back to List' : '목록으로 돌아가기'}
          </a>
        </div>

        {/* 제목 섹션 */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {currentContent.title || 'Story'}
          </h1>
          {currentContent.subtitle && (
            <p className="text-xl text-gray-600 mb-6">
              {currentContent.subtitle}
            </p>
          )}
          <div className="text-sm text-gray-500">
            <time dateTime={new Date(story.created_at).toISOString()}>
              {new Date(story.created_at).toLocaleDateString(
                i18n.language === 'en' ? 'en-US' : 'ko-KR', 
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }
              )}
            </time>
          </div>
        </header>

        {/* YouTube 영상 */}
        {embedUrl && (
          <div className="mb-8">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={embedUrl}
                title={currentContent.title || 'Story'}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* 본문 */}
        <main>
          <article className="prose prose-lg max-w-none mb-12" itemScope itemType="https://schema.org/BlogPosting">
            <div 
              dangerouslySetInnerHTML={{ __html: cleanedContent }}
              className="text-gray-800 leading-relaxed"
            />
          </article>
        </main>
      </div>

      {/* 추천 포스트 - 풀 width */}
      <RecommendedPosts currentSlug={story.slug || ''} />
    </>
  );
}