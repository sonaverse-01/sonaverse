'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../contexts/LanguageContext';

interface PressData {
  slug: string;
  created_at: string;
  press_name: any;
  title: any;
  body: string;
  external_link?: string;
  is_active: boolean;
}

export default function ClientPressDetail({ slug }: { slug: string }) {
  const { language, isClient } = useLanguage();
  const [pressData, setPressData] = useState<PressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPressData = async () => {
      try {
        setLoading(true);
        const currentLang = isClient ? language : 'ko';
        const res = await fetch(`/api/press/${slug}?lang=${currentLang}`);
        if (!res.ok) {
          setError(res.status === 404 ? 'not_found' : 'fetch_error');
          return;
        }
        const data = await res.json();
        setPressData(data);
      } catch (err) {
        console.error('Error fetching press data:', err);
        setError('fetch_error');
      } finally {
        setLoading(false);
      }
    };
    if (slug && isClient) fetchPressData();
  }, [slug, isClient, language]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center px-4 py-12 bg-white">
        <div className="text-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error === 'not_found' || !pressData) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center px-4 py-12 bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{language === 'en' ? 'The requested press release could not be found.' : '해당 보도 자료를 찾을 수 없습니다.'}</h1>
          <Link 
            href="/press" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'en' ? 'Back to List' : '목록으로 돌아가기'}
          </Link>
        </div>
      </div>
    );
  }

  if (error === 'fetch_error') {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center px-4 py-12 bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{language === 'en' ? 'An error occurred.' : '오류가 발생했습니다.'}</h1>
          <Link 
            href="/press" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'en' ? 'Back to List' : '목록으로 돌아가기'}
          </Link>
        </div>
      </div>
    );
  }

  const titleText = (pressData as any).title || '';
  const pressName = (pressData as any).press_name || '';

  const bodyHtml = typeof pressData.body === 'string' ? pressData.body : '';
  const firstImgMatch = bodyHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  const imageUrl = firstImgMatch?.[1] || 'https://sonaverse.kr/logo/symbol_logo.png';
  const pageUrl = `https://sonaverse.kr/press/${slug}`;
  const text = bodyHtml.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center px-4 py-12 bg-white">
      {/* NewsArticle JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: titleText,
            description: (text || titleText).slice(0, 200),
            image: imageUrl,
            url: pageUrl,
            mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
            inLanguage: 'ko-KR',
            datePublished: pressData.created_at,
            publisher: {
              '@type': 'Organization',
              name: 'SONAVERSE',
              url: 'https://sonaverse.kr',
              logo: { '@type': 'ImageObject', url: 'https://sonaverse.kr/logo/symbol_logo.png' }
            },
            sourceOrganization: pressName ? { '@type': 'Organization', name: pressName } : undefined,
            isBasedOn: pressData.external_link || undefined,
            sameAs: pressData.external_link ? [pressData.external_link] : undefined,
            articleBody: text
          })
        }}
      />

      <div className="max-w-2xl w-full mx-auto">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link 
            href="/press" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'en' ? 'Back to List' : '목록으로 돌아가기'}
          </Link>
        </div>
        {/* 제목 및 메타 정보 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{titleText || '제목 없음'}</h1>
          <div className="text-sm text-gray-500 mb-4">
            {pressName} | {new Date(pressData.created_at).toLocaleDateString()}
          </div>
        </div>
        {/* 본문 내용 */}
        <div className="prose prose-sm md:prose-base mx-auto mb-8 max-w-none">
          <div dangerouslySetInnerHTML={{ __html: pressData.body }} />
        </div>
        
        {/* 이미지 정렬을 위한 추가 스타일 */}
        <style jsx>{`
          .prose img[style*="float: left"] {
            float: left !important;
            margin: 0 20px 16px 0 !important;
            clear: left !important;
            display: block !important;
          }
          
          .prose img[style*="float: right"] {
            float: right !important;
            margin: 0 0 16px 20px !important;
            clear: right !important;
            display: block !important;
          }
          
          .prose img[style*="margin: 16px auto"] {
            display: block !important;
            margin: 16px auto !important;
            float: none !important;
            clear: both !important;
          }
          
          /* 일반적인 width 스타일 유지 */
          .prose img[style*="width:"] {
            height: auto !important;
          }
        `}</style>
        {/* 외부 링크 버튼 */}
        {pressData.external_link && (
          <div className="text-center">
            <a 
              href={pressData.external_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block bg-[#bda191] text-white px-6 py-3 rounded shadow hover:bg-[#a88b6a] transition"
            >
              {language === 'en' ? 'View Original Article' : '원본 기사 보기'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}


