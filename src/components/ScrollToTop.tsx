'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ScrollToTopProps {
  className?: string;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치에 따라 버튼 표시/숨김
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-xl border border-gray-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group ${className}`}
      aria-label="맨 위로 이동"
    >
      <div className="relative w-6 h-6 md:w-8 md:h-8 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
        <Image
          src="/logo/symbol_logo.png"
          alt="SONAVERSE 로고"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 24px, 32px"
        />
      </div>
      
      {/* 호버 시 표시되는 툴팁 */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap pointer-events-none">
        맨 위로
        <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
      </div>
    </button>
  );
};

export default ScrollToTop;