'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: 'ko' | 'en';
  setLanguage: (lang: 'ko' | 'en') => void;
  isClient: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

// 더 이상 사용하지 않음 - useState 초기화 함수로 대체됨

// 쿠키에 언어 설정을 저장하는 함수
const setLanguageCookie = (lang: 'ko' | 'en') => {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1); // 1년 후 만료
  document.cookie = `language=${lang}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

// 서버사이드에서 쿠키 읽기 헬퍼 함수
const getServerSideLang = (): 'ko' | 'en' => {
  // 서버에서는 항상 ko 반환 (SSR 일관성을 위해)
  return 'ko';
};

// 클라이언트사이드에서 쿠키 읽기 헬퍼 함수  
const getClientSideLang = (): 'ko' | 'en' => {
  if (typeof window === 'undefined') return 'ko';
  
  const cookies = document.cookie.split(';');
  const langCookie = cookies.find(cookie => cookie.trim().startsWith('language='));
  
  if (langCookie) {
    const lang = langCookie.split('=')[1];
    return (lang === 'ko' || lang === 'en') ? lang : 'ko';
  }
  
  const savedLanguage = localStorage.getItem('language');
  return (savedLanguage === 'ko' || savedLanguage === 'en') ? savedLanguage : 'ko';
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // SSR에서는 항상 'ko', 클라이언트에서만 쿠키/localStorage 확인
  const [language, setLanguageState] = useState<'ko' | 'en'>('ko');
  const [isHydrated, setIsHydrated] = useState(false);

  const setLanguage = (lang: 'ko' | 'en') => {
    setLanguageState(lang);
    
    if (typeof window !== 'undefined') {
      // 쿠키와 localStorage 둘 다 저장
      setLanguageCookie(lang);
      localStorage.setItem('language', lang);
    }
  };

  // 하이드레이션 완료 후 클라이언트 언어 설정 로드
  useEffect(() => {
    setIsHydrated(true);
    // 하이드레이션 완료 후 클라이언트 언어 설정을 로드
    const clientLang = getClientSideLang();
    if (clientLang !== language) {
      setLanguageState(clientLang);
    }
  }, []);

  const value = {
    language,
    setLanguage,
    isClient: isHydrated // 하이드레이션 완료 후에만 true
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 