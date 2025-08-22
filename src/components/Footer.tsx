'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Footer (공통 푸터)
 * - 3등분 그리드 구조
 * - 좌측: 로고 + 사업자 정보
 * - 중앙: SONAVERSE + 네비게이션
 * - 우측: 고객지원 + SNS + 개인정보처리방침
 */
const Footer: React.FC = () => {
  const { language, isClient } = useLanguage();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openPrivacyModal = () => setIsPrivacyModalOpen(true);
  const closePrivacyModal = () => setIsPrivacyModalOpen(false);

  return (
    <footer className="w-full border-t mt-0 pt-6 sm:pt-8" style={{ backgroundColor: '#f0ece9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 lg:gap-12">
                      {/* 좌측: 로고 + 사업자 정보 */}
            <div className="flex flex-col md:col-span-6">
            {/* 로고 (next/image로 최적화, lazy) */}
            <a href="/" className="mb-3 sm:mb-4" aria-label="SONAVERSE Home">
              <Image
                src="/logo/symbol_logo.png"
                alt={language === 'en' ? 'SONAVERSE symbol logo' : '소나버스 심볼 로고'}
                width={56}
                height={64}
                loading="lazy"
                sizes="(max-width: 640px) 35px, 56px"
                className="w-auto h-10 sm:h-12"
              />
            </a>
            {/* 사업자 정보입니다. */}
            <div className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-1.5">
              <div><span className="font-bold">{language === 'en' ? 'Company Name' : '상호명'}:</span> {language === 'en' ? 'Sonaverse Co., Ltd.' : '(주)소나버스'}</div>
              <div><span className="font-bold">{language === 'en' ? 'CEO' : '대표자명'}:</span> {language === 'en' ? 'Lee Su-jin' : '이수진'}</div>
              <div><span className="font-bold">{language === 'en' ? 'Business Address' : '사업장 주소'}:</span> {language === 'en' ? '319, Chuncheon ICT Venture Center, 7, Huseok-ro 462beon-gil, Chuncheon-si, Gangwon-do, 24232, Republic of Korea' : '(24232) 강원특별자치도 춘천시 후석로462번길 7 춘천ICT벤처센터 319호'}</div>
              <div><span className="font-bold">{language === 'en' ? 'Phone' : '대표 전화'}:</span> {isMobile ? (
                <a href="tel:010-5703-8899" className="hover:text-[#bda191] transition-colors cursor-pointer">010-5703-8899</a>
              ) : (
                '010-5703-8899'
              )}</div>
              <div><span className="font-bold">{language === 'en' ? 'Business Registration Number' : '사업자등록번호'}:</span> 697-87-02555</div>
              <div><span className="font-bold">{language === 'en' ? 'E-commerce Registration Number' : '통신판매업 신고 번호'}:</span> 2023-강원춘천-0688</div>
                {/* 개인정보처리방침입니다. */}
              <a
                href="#"
                onClick={openPrivacyModal}
                className="font-bold cursor-pointer transition-colors hover:text-[#bda191]"
                style={{ textDecoration: 'none' }}
              >
                {language === 'en' ? 'Privacy Policy' : '개인정보처리방침'}
              </a>
              {/* 다운로드 버튼 */}
              <a
                href={`/api/download?lang=${language === 'en' ? 'en' : 'ko'}`}
                className="font-bold cursor-pointer transition-colors hover:text-[#bda191] flex items-center gap-1 mt-2"
                style={{ textDecoration: 'none' }}
              >                
                {language === 'en' ? 'Product Catalog Download' : '제품 카탈로그 다운로드'}
              </a>
            </div>
          </div>

          {/* 중앙: SONAVERSE + 네비게이션 */}
          <div className="flex flex-col md:col-span-3 md:col-start-9">
            {/* SONAVERSE 텍스트 + 언더라인 */}
            <div className="mb-4">
              <a href="/"><h3 className="text-xl font-bold text-gray-900 mb-2">SONAVERSE</h3></a>
              <div className="w-16 h-0.5" style={{ backgroundColor: '#bda191' }}></div>
            </div>
            {/* 네비게이션 항목들 */}
            <nav className="flex flex-col space-y-2 text-sm mt-2">              
              <a href="/products/manbo-walker" className="relative w-fit transition-colors duration-200 hover:text-[#bda191] hover:after:scale-x-100 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:bg-[#bda191] after:rounded-full after:scale-x-0 after:transition-transform after:duration-200 after:origin-left font-medium">{language === 'en' ? 'Manbo Walker' : '만보 보행기'}</a>
              <a href="/products/bodeum-diaper" className="relative w-fit transition-colors duration-200 hover:text-[#bda191] hover:after:scale-x-100 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:bg-[#bda191] after:rounded-full after:scale-x-0 after:transition-transform after:duration-200 after:origin-left font-medium">{language === 'en' ? 'BO DUME Diaper' : '보듬 기저귀'}</a>
              <a href="/sonaverse-story" className="relative w-fit transition-colors duration-200 hover:text-[#bda191] hover:after:scale-x-100 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:bg-[#bda191] after:rounded-full after:scale-x-0 after:transition-transform after:duration-200 after:origin-left font-medium">{language === 'en' ? 'SONAVERSE Story' : '소나버스 스토리'}</a>
              <a href="/press" className="relative w-fit transition-colors duration-200 hover:text-[#bda191] hover:after:scale-x-100 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:bg-[#bda191] after:rounded-full after:scale-x-0 after:transition-transform after:duration-200 after:origin-left font-medium">{language === 'en' ? 'Press' : '언론보도'}</a>
              <a href="/inquiry" className="relative w-fit transition-colors duration-200 hover:text-[#bda191] hover:after:scale-x-100 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:bg-[#bda191] after:rounded-full after:scale-x-0 after:transition-transform after:duration-200 after:origin-left font-medium">{language === 'en' ? 'Purchase/Partnership Inquiry' : '구매/제휴 문의'}</a>
            </nav>
          </div>

          {/* 우측: 고객지원 + SNS + 개인정보처리방침 */}
          <div className="flex flex-col md:col-span-4 md:col-start-12">
            {/* 고객지원 텍스트 + 언더라인 */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{language === 'en' ? 'Customer Support' : '고객지원'}</h3>
              <div className="w-16 h-0.5" style={{ backgroundColor: '#bda191' }}></div>
            </div>
            {/* 고객센터 정보 */}
            <div className="text-sm text-gray-600 space-y-1 mb-6">
              <div className="font-bold mb-1">{language === 'en' ? 'Customer Service' : '고객센터'}</div>
              {isMobile ? (
                <a href="tel:010-5703-8899" className="hover:text-[#bda191] transition-colors cursor-pointer mb-1 block">010-5703-8899</a>
              ) : (
                <div className="mb-1">010-5703-8899</div>
              )}
              <div className="font-bold mb-1">{language === 'en' ? 'Email' : '이메일'}</div>
              <a href="mailto:shop@sonaverse.kr" className="hover:text-[#bda191] transition-colors cursor-pointer mb-1 block">shop@sonaverse.kr</a>
              <div className="font-bold mb-1">{language === 'en' ? 'Operating Hours' : '운영시간'}</div>
              <div className="mb-1">{language === 'en' ? 'Weekdays 09:30 ~ 18:30' : '평일 09:30 ~ 18:30'}</div>
              <div>{language === 'en' ? '(Closed on weekends and holidays)' : '(주말·공휴일 휴무)'}</div>
            </div>
            {/* SNS 로고들 */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">SNS</h3>
              <div className="w-8 h-0.5 mb-3" style={{ backgroundColor: '#bda191' }}></div>
              <div className="flex space-x-4">
                <a href="https://blog.naver.com/sona-verse" aria-label={language === 'en' ? 'Visit SONAVERSE Naver Blog' : '소나버스 네이버 블로그 방문'} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/@sonaverse.official" aria-label={language === 'en' ? 'SONAVERSE official YouTube channel' : '소나버스 공식 유튜브 채널'} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/sonaverse.kr/" aria-label={language === 'en' ? 'SONAVERSE Instagram' : '소나버스 인스타그램'} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://pf.kakao.com/_ourcompany" aria-label={language === 'en' ? 'SONAVERSE Kakao Channel' : '소나버스 카카오 채널'} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors">
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                  </svg>
                </a>
              </div>
            </div>
            
                      </div>
          </div>
        </div>
        
        {/* 개인정보처리방침 모달 */}
        <PrivacyPolicyModal 
          isOpen={isPrivacyModalOpen} 
          onClose={closePrivacyModal} 
        />
      </footer>
    );
  };

export default Footer; 