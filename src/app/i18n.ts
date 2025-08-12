import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import nextI18NextConfig from '../../next-i18next.config.js';

import ko from '../../public/locales/ko/common.json';
import en from '../../public/locales/en/common.json';

const resources = {
  ko: { common: ko },
  en: { common: en },
};

// 쿠키에서 언어 감지
const getInitialLanguage = (): 'ko' | 'en' => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const langCookie = cookies.find(cookie => cookie.trim().startsWith('language='));
    
    if (langCookie) {
      const lang = langCookie.split('=')[1];
      return (lang === 'ko' || lang === 'en') ? lang : nextI18NextConfig.i18n.defaultLocale as 'ko' | 'en';
    }
    
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'ko' || savedLanguage === 'en') {
      return savedLanguage;
    }
  }
  
  return nextI18NextConfig.i18n.defaultLocale as 'ko' | 'en';
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: nextI18NextConfig.i18n.defaultLocale as 'ko' | 'en',
    interpolation: { escapeValue: false },
    ns: ['common'],
    defaultNS: 'common',
  });

export default i18n; 