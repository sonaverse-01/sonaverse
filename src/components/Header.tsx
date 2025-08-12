'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Header (공통 헤더)
 * - 언어 선택에 따라 로고 이미지 변경 (ko: ko_logo, en: en_logo)
 * - 디폴트는 ko_logo
 * - 반응형 모바일 네비게이션 포함
 */
const Header: React.FC = () => {
  const { language, setLanguage, isClient } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isMobileAboutOpen, setIsMobileAboutOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const headerRef = useRef<HTMLElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  
  // LanguageContext의 language 상태만 사용 (SSR 일관성 보장)
  const logoSrc = language === 'en' ? '/logo/en_logo.png' : '/logo/ko_logo.png';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 바깥 클릭 시 드롭다운 닫힘
  useEffect(() => {
    if (!isClient || !isDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isClient, isDropdownOpen]);

  // ABOUT US 드롭다운 바깥 클릭 시 닫힘
  useEffect(() => {
    if (!isClient || !isAboutDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(e.target as Node)) {
        setIsAboutDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isClient, isAboutDropdownOpen]);

  // 하이드레이션 전후에도 훅 순서가 같도록, 조건부 early return은 사용하지 않습니다.

  // Measure header height for positioning mobile drawer below the header
  useEffect(() => {
    if (!isClient) return;
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isClient]);

  return (
    <header ref={headerRef as any} className="w-full sticky top-0 z-50 relative" style={{ backgroundColor: '#f0ece9' }}>
      {/* 헤더 하단 그라데이션 */}
      <div className="absolute left-0 right-0 bottom-0 h-6 pointer-events-none" style={{background: 'linear-gradient(to bottom, rgba(240,236,233,0) 0%, rgba(240,236,233,0.7) 60%, rgba(240,236,233,1) 100%)'}} />
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2 min-h-[3rem]">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={logoSrc} alt="SONAVERSE Logo" className="h-6 sm:h-8 w-auto" />
        </a>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-4 xl:gap-8 items-center text-sm xl:text-base font-medium tracking-wide">
          <a href="/" className="nav-link">{language === 'en' ? 'Home' : '홈'}</a>
          <div className="relative" ref={dropdownRef}>
            <button
              className="nav-link focus:outline-none"
              onClick={() => setIsDropdownOpen((open) => !open)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              type="button"
            >
              {language === 'en' ? 'Products' : '제품소개'}
            </button>
            <div className={`absolute left-1/2 -translate-x-1/2 mt-3 flex gap-4 bg-white/90 backdrop-blur-md border border-[#e5e0db] rounded-2xl shadow-2xl px-4 py-4 min-w-[320px] xl:min-w-[380px] z-50 transition-all duration-200 ${isDropdownOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
              <a href="/products/manbo-walker" className="flex-1 flex flex-col items-center justify-center gap-2 px-3 xl:px-6 py-3 rounded-xl hover:bg-[#f0ece9] hover:text-[#bda191] transition-colors duration-200 text-sm xl:text-base font-medium shadow-sm">
                <svg width="24" height="24" className="xl:w-8 xl:h-8" fill="none" viewBox="0 0 24 24"><path d="M7 20v-2a2 2 0 0 1 2-2h2.5M16 20v-2a2 2 0 0 0-2-2h-1.5M12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-4.5 8.5l2.5-2.5m0 0l2.5 2.5m-2.5-2.5V20" stroke="#bda191" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-center leading-tight">{language === 'en' ? 'Manbo Walker' : '만보 보행기'}</span>
              </a>
              <a href="/products/bodeum-diaper" className="flex-1 flex flex-col items-center justify-center gap-2 px-3 xl:px-6 py-3 rounded-xl hover:bg-[#f0ece9] hover:text-[#bda191] transition-colors duration-200 text-sm xl:text-base font-medium shadow-sm">
                <svg width="24" height="24" className="xl:w-8 xl:h-8" fill="none" viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="8" rx="4" stroke="#bda191" strokeWidth="1.5"/><path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="#bda191" strokeWidth="1.5"/></svg>
                <span className="text-center leading-tight">{language === 'en' ? 'Bodume Diaper' : '보듬 기저귀'}</span>
              </a>
            </div>
          </div>

          <a href="/press" className="nav-link">{language === 'en' ? 'Press' : '언론보도'}</a>
          <div className="relative" ref={aboutDropdownRef}>
            <button
              className="nav-link focus:outline-none"
              onClick={() => setIsAboutDropdownOpen((open) => !open)}
              aria-expanded={isAboutDropdownOpen}
              aria-haspopup="true"
              type="button"
            >
              ABOUT US
            </button>
            <div className={`absolute left-1/2 -translate-x-1/2 mt-3 flex flex-col bg-white/90 backdrop-blur-md border border-[#e5e0db] rounded-2xl shadow-2xl px-4 py-4 min-w-[240px] xl:min-w-[280px] z-50 transition-all duration-200 ${isAboutDropdownOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
              <a href="/sonaverse-story" className="flex items-center gap-3 px-4 xl:px-6 py-3 rounded-xl hover:bg-[#f0ece9] hover:text-[#bda191] transition-colors duration-200 text-sm xl:text-base font-medium">
                <svg width="20" height="20" className="xl:w-6 xl:h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#bda191" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>{language === 'en' ? 'Sonaverse Story' : '소나버스 스토리'}</span>
              </a>
              <a href="/company-history" className="flex items-center gap-3 px-4 xl:px-6 py-3 rounded-xl hover:bg-[#f0ece9] hover:text-[#bda191] transition-colors duration-200 text-sm xl:text-base font-medium">
                <svg width="20" height="20" className="xl:w-6 xl:h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="#bda191" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>{language === 'en' ? 'Company History' : '기업 연혁'}</span>
              </a>
            </div>
          </div>
          <a href="/inquiry" className="nav-link">{language === 'en' ? 'Contact' : '기업 문의'}</a>
        </nav>
        
        {/* Language Dropdown */}
        <select
          className="hidden lg:block border border-[#e5e0db] rounded-lg px-2 xl:px-3 py-1.5 xl:py-2 bg-white/80 shadow-sm text-xs xl:text-sm focus:ring-2 focus:ring-[#bda191] focus:border-[#bda191] transition flex-shrink-0"
          value={language}
          onChange={e => setLanguage(e.target.value as 'ko' | 'en')}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
        
        {/* Mobile Hamburger */}
        <button 
          className="lg:hidden flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[2.5rem] h-10"
          onClick={toggleMobileMenu}
          aria-label="메뉴 열기"
        >
          <span className="text-lg">{isMobileMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Navigation with overlay and right-half drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed left-0 right-0 z-[60]" style={{ top: headerHeight, height: `calc(100vh - ${headerHeight}px)` }}>
          {/* overlay (below header) */}
          <div className="absolute left-0 right-0 bottom-0 bg-black/30" style={{ top: 0 }} onClick={() => setIsMobileMenuOpen(false)} />
          {/* right drawer */}
          <nav className="absolute right-0 top-0 h-full w-1/2 min-w-[260px] max-w-[360px] bg-white border-l border-gray-200 shadow-xl px-4 py-4 space-y-3 overflow-y-auto">
            <a href="/" className="block py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-800 font-medium" onClick={toggleMobileMenu}>{language === 'en' ? 'Home' : '홈'}</a>
            
            <div className="rounded-lg">
              <button 
                className="w-full font-semibold text-gray-800 px-3 py-2 bg-gray-50 rounded-t-lg flex items-center justify-between"
                onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
              >
                <span>{language === 'en' ? 'Products' : '제품소개'}</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${isMobileProductsOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isMobileProductsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-3 py-2 space-y-2">
                  <a href="/products/manbo-walker" className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded text-gray-600" onClick={toggleMobileMenu}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M7 20v-2a2 2 0 0 1 2-2h2.5M16 20v-2a2 2 0 0 0-2-2h-1.5M12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-4.5 8.5l2.5-2.5m0 0l2.5 2.5m-2.5-2.5V20" stroke="#bda191" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {language === 'en' ? 'Manbo Walker' : '만보 보행기'}
                  </a>
                  <a href="/products/bodeum-diaper" className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded text-gray-600" onClick={toggleMobileMenu}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="8" rx="4" stroke="#bda191" strokeWidth="1.5"/><path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="#bda191" strokeWidth="1.5"/></svg>
                    {language === 'en' ? 'Bodume Diaper' : '보듬 기저귀'}
                  </a>
                </div>
              </div>
            </div>
            
            <a href="/press" className="block py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-800 font-medium" onClick={toggleMobileMenu}>{language === 'en' ? 'Press' : '언론보도'}</a>
            
            <div className="rounded-lg">
              <button 
                className="w-full font-semibold text-gray-800 px-3 py-2 bg-gray-50 rounded-t-lg flex items-center justify-between"
                onClick={() => setIsMobileAboutOpen(!isMobileAboutOpen)}
              >
                <span>ABOUT US</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${isMobileAboutOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isMobileAboutOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-3 py-2 space-y-2">
                  <a href="/sonaverse-story" className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded text-gray-600" onClick={toggleMobileMenu}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#bda191" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {language === 'en' ? 'Sonaverse Story' : '소나버스 스토리'}
                  </a>
                  <a href="/company-history" className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded text-gray-600" onClick={toggleMobileMenu}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="#bda191" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {language === 'en' ? 'Company History' : '기업 연혁'}
                  </a>
                </div>
              </div>
            </div>
            
            <a href="/inquiry" className="block py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-800 font-medium" onClick={toggleMobileMenu}>{language === 'en' ? 'Contact' : '기업 문의'}</a>
            
            {/* Mobile Language Selection */}
            <div className="pt-3 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-2">언어 선택 / Language</div>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#bda191] focus:border-[#bda191] bg-white"
                value={language}
                onChange={e => setLanguage(e.target.value as 'ko' | 'en')}
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
          </nav>
        </div>
      )}
      {/* 스타일 추가 (글로벌 또는 컴포넌트 내부) */}
      <style jsx global>{`
        .nav-link {
          display: inline-block;
          padding: 0.5rem 1.25rem;
          font-size: 1rem;
          font-weight: 500;
          color: #222;
          background: none;
          border: none;
          border-radius: 0.75rem;
          transition: color 0.2s, background 0.2s, box-shadow 0.2s;
          position: relative;
          line-height: 1.5;
          text-align: center;
        }
        .nav-link:hover, .nav-link:focus {
          color: #bda191;
          background: #f0ece9;
          box-shadow: 0 2px 8px 0 rgba(189,161,145,0.08);
          text-decoration: none;
        }
      `}</style>
    </header>
  );
};

export default Header; 