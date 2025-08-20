'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollToTop from '../components/ScrollToTop';

// 타입 정의
interface SonaverseStory {
  _id: string;
  slug: string;
  title: string;
  content: {
    ko: {
      title: string;
      subtitle: string;
      body: string;
      thumbnail_url?: string;
    };
    en: {
      title: string;
      subtitle: string;
      body: string;
      thumbnail_url?: string;
    };
  };
  youtube_url?: string;
  summary?: string;
  excerpt?: string;
  thumbnail?: string;
  published_date?: string;
  created_at: string;
  is_published: boolean;
  is_main?: boolean;
}

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
  published_date?: string;
  created_at: string;
  is_published: boolean;
}



interface Product {
  _id: string;
  slug: string;
  name: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
  image?: string;
  created_at: string;
  is_active: boolean;
}


interface CompanyHistory {
  year: string;
  title: string;
  description: string;
  category: 'past' | 'present' | 'future';
}

const heroContent = {
  ko: {
    headline: '시니어의 더 나은 내일을 위해',
    subheadline: '소나버스',
    description: '불편을 겪는 사용자를 통해 발견한 혁신.\n명확한 브랜딩으로 시니어 생활 문제를 해결합니다.',
    cta: '',
  },
  en: {
    headline: 'For a Better Tomorrow for Seniors',
    subheadline: 'SONAVERSE',
    description: 'Innovation discovered through users experiencing difficulties. Clear branding to solve senior life problems.',
    cta: '',
  },
};

// 우리가 해결하고자 하는 문제들
const problemsToSolve = {
  ko: [
    {
      title: '안전성 및 성능의 한계',
      description: '불규칙한 지형이나 경사면에서 제동·추진력 부족으로 사고 위험 증가',
      icon: '/logo/symbol_logo.png'
    },
    {
      title: '사용자 중심의 인체공학 설계 미흡',
      description: '시니어의 체형과 운동 능력을 반영하지 못한 설계로 장시간 사용 곤란',
      icon: '/logo/symbol_logo.png'
    },
    {
      title: '심리적 만족감을 고려하지 않은 디자인',
      description: '시니어의 정서적 안정과 자존감을 고려하지 않음',
      icon: '/logo/symbol_logo.png'
    },
    {
      title: '고령화 시대 속 기술 사각지대',
      description: 'AI·센서  등 최신 기술은 시니어가 받아들이는 속도와 일상생활에서 필요한 기술은 적용되지 않아 시장의 발전 지연',
      icon: '/logo/symbol_logo.png'
    }
  ],
  en: [
    {
      title: 'Safety & Performance Limitations',
      description: 'Increased accident risk due to insufficient braking and propulsion on irregular terrain',
      icon: '/logo/symbol_logo.png'
    },
    {
      title: 'Insufficient User-Centered Ergonomic Design',
      description: 'Design that fails to reflect seniors\' body types and motor abilities',
      icon: '/logo/symbol_logo.png'
    },
    {
      title: 'Design Without Psychological Satisfaction',
      description: 'Does not consider seniors\' emotional stability and self-esteem',
      icon: '/logo/symbol_logo.png'
    },
    {
      title: 'Technology Blind Spots in an Aging Era',
      description: 'Market development is delayed because AI, sensors, and other modern technologies are not adapted to seniors\' adoption pace,\n and the daily-life technologies they need remain unapplied',
      icon: '/logo/symbol_logo.png'
    }
  ]
};

// 만보 워크메이트 상세 정보
const manboDetails = {
  ko: {
    title: '만보 (MANBO)',
    subtitle: '하이브리드형 워크메이트',
    description: '',
    features: [
      {
        title: '하이브리드 주행 시스템',
        description: '전동과 비전동 모드를 자유롭게 선택할 수 있어, 다양한 보행 환경에 맞춰 유연하게 대응 가능',
        details: ['비전동모드: 가볍게 걸을 땐 스스로 밀며 사용', '전동모드: 언덕길이나 피로 상황에서는 자동 보행 보조']
      },
      {
        title: '경사지 제어 기능',
        description: '오르막엔 추진력, 내리막엔 제동력으로 경사 지형에서도 안정적인 보행을 지원하는 스마트 제어 기능',
        details: ['사용자의 힘과 속도에 맞춰 미세하게 구동하는 미세 모터 적용', '추진력 제공과 사용자 지지력 제동력 제공']
      },
      {
        title: '비상 시 자동 정지 기능',
        description: '센서 반응형 브레이크 탑재로 위급 상황 발생 시 즉각 정지하여, 돌발 사고를 효과적으로 차단',
        details: ['제어패널, 전원모듈, 구동 및 제어 PCB, 터치센서 통합']
      },
      {
        title: '실종 방지 기능',
        description: 'GPS 기반 위치 추적 시스템을 통한 실시간 모니터링으로, 치매 등 고위험군의 실종 사고 예방',
        details: ['개별 프로토타입 완료', '가족이 스마트폰으로 실시간 위치 확인 가능']
      }
    ],
    status: '1차 시제품 제작 및 1차 성능평가 완료, 현재 2차 시제품 제작 중, 2026년 6월 런칭 목표'
  },
  en: {
    title: 'MANBO',
    subtitle: 'Hybrid Walkmate',
    description: 'Korea\'s only hybrid walkmate with differentiated bar handle and cylindrical frame design for safety, smart slope control functions for convenience, maximizing user satisfaction.',
    features: [
      {
        title: 'Hybrid Driving System',
        description: 'Freely choose between electric and manual modes, flexibly responding to various walking environments',
        details: ['Manual Mode: Push yourself when walking lightly', 'Electric Mode: Automatic walking assistance on hills or when tired']
      },
      {
        title: 'Slope Control Function',
        description: 'Smart control function providing propulsion on uphill and braking on downhill for stable walking on slopes',
        details: ['Fine motor applied to drive precisely according to user\'s strength and speed', 'Provides propulsion and user support braking']
      },
      {
        title: 'Emergency Auto-Stop Function',
        description: 'Sensor-responsive brakes immediately stop in emergency situations, effectively preventing sudden accidents',
        details: ['Integrated control panel, power module, drive & control PCB, touch sensor']
      },
      {
        title: 'Lost Prevention Function',
        description: 'Real-time monitoring through GPS-based location tracking system to prevent disappearance of high-risk groups like dementia patients',
        details: ['Individual prototype completed', 'Family can check real-time location via smartphone']
      }
    ],
    status: '1st prototype completed and 1st performance evaluation done, currently making 2nd prototype, targeting June 2026 launch'
  }
};

// 보듬 기저귀 상세 정보
const bodeumDetails = {
  ko: {
    title: '보듬 (BO DUME)',    
    subtitle: '프리미엄 성인용 기저귀',
    description: '',
    meaning: '',
    features: [
      {
        title: '안심할 수 있는 코어 설계',
        icon: '💧'
      },
      {
        title: '샘 방지막 설계',
        icon: '🛡️'
      },
      {
        title: '천연 펄프 사용',
        icon: '🌿'
      },
      {
        title: '편안한 허리밴드',
        icon: '✨'
      },
      {
        title: '믿을 수 있는 제품',
        icon: '🏆'
      }
    ],
    lineup: [
      '팬티형 기저귀 중형',
      '팬티형 기저귀 대형', 
      '속기저귀 일자형',
      '속기저귀 라운드형',
      '위생 깔개매트'
    ],
    business: '한번 사용하면 계속 구매하게 되는 상품으로 브랜딩 후 지속적인 매출 가능.\n이후 수출 국가에 맞는 다양한 사이즈, 품목 지속적으로 증가 계획'
  },
  en: {
    title: 'BO DUME',
    subtitle: 'Small Consideration for Parents',
    description: 'Created through real field experience of actual buyers and users of adult diapers. Developed in partnership with active caregivers to reflect improvements from actual users and buyers.',
    meaning: '"BO DUME" means caring for parents\' daily life with love.',
    features: [
      {
        title: 'Reliable Core Design',
        icon: '💧'
      },
      {
        title: 'Leak Prevention Design',
        icon: '🛡️'
      },
      {
        title: 'Natural Pulp Material',
        icon: '🌿'
      },
      {
        title: 'Comfortable Waistband',
        icon: '✨'
      },
      {
        title: 'Trustworthy Product',
        icon: '🏆'
      }
    ],
    lineup: [
      'Panty-type Diaper Medium',
      'Panty-type Diaper Large',
      'Insert Diaper Straight',
      'Insert Diaper Round',
      'Hygiene Pad Mat'
    ],
    business: 'Products that customers continue to purchase after first use, enabling continuous sales after branding. Plans to continuously increase various sizes and items for export countries.'
  }
};


// 회사 연혁
const companyHistory = {
  ko: [
    {
      year: '2022',
      title: '㈜소나버스 법인 설립',
      events: ['기업부설연구소 설립', '여성기업 인증 취득'],
      description: '시니어 케어 시장 진입과 혁신 기술 개발의 시작'
    },
    {
      year: '2023',
      title: '기술력 검증 및 성장 기반 구축',
      events: ['㈜강원대학교 기술지주회사 출자', 'G-스타트업 예비창업 지원사업 선정', 'LINC 3.0 기술사업화 지원사업 선정', '연구소 기업 승인', '벤처기업 인증 취득'],
      description: '정부 지원 사업 선정과 벤처 생태계 진입'
    },
    {
      year: '2024',
      title: '글로벌 진출 및 품질 인증',
      events: ['ISO 인증 취득(9001/14001)', '2024 여성창업경진대회 이사장상 수상', '강소특구 기술이전사업화 R&D 선정', '창업성장기술개발사업(디딤돌)'],
      description: '국제 표준 인증과 글로벌 파트너십 구축'
    },
    {
      year: '2025',
      title: '제품 상용화 원년',
      events: ['신용보증기금 Startup-NEST 17기 선정', '창업중심대학 선정', '리틀펭귄 보증 확보', '글로벌 MOU 체결', '보듬 기저귀 런칭', '크라우드 펀딩 진행', '알리바바 입점'],
      description: '첫 번째 제품 출시와 본격적인 시장 진입'
    },
    {
      year: '2026',
      title: '하이브리드 워크메이트 출시',
      events: ['만보 런칭 목표(2026.6)'],
      description: '혁신적인 보행 보조 기술의 상용화 달성'
    }
  ],
  en: [
    {
      year: '2022',
      title: 'Sonaverse Co., Ltd. Establishment',
      events: ['Corporate R&D Institute Establishment', 'Women-owned Business Certification'],
      description: 'Entry into senior care market and beginning of innovative technology development'
    },
    {
      year: '2023',
      title: 'Technology Validation and Growth Foundation',
      events: ['Kangwon National University Technology Holding Investment', 'G-Startup Pre-startup Support Program Selection', 'LINC 3.0 Technology Commercialization Support', 'Research Institute Company Approval', 'Venture Company Certification'],
      description: 'Government support program selection and venture ecosystem entry'
    },
    {
      year: '2024',
      title: 'Global Expansion and Quality Certification',
      events: ['ISO Certification (9001/14001)', '2024 Women Entrepreneurship Contest Chairman Award', 'Technology Transfer R&D Selection', 'Startup Growth Technology Development Project (Stepping Stone)'],
      description: 'International standard certification and global partnership establishment'
    },
    {
      year: '2025',
      title: 'Product Commercialization Year',
      events: ['Korea Credit Guarantee Fund Startup-NEST 17th Selection', 'Startup-Centered University Selection', 'Little Penguin Guarantee Secured', 'Global MOU Signing', 'BO DUME Diaper Launch', 'Crowdfunding Campaign', 'Alibaba Platform Entry'],
      description: 'First product launch and full-scale market entry'
    },
    {
      year: '2026',
      title: 'Hybrid Walkmate Launch',
      events: ['Manbo Launch Target (June 2026)'],
      description: 'Commercialization of innovative walking assistance technology'
    }
  ]
};

// 비즈니스 모델 및 시장 전략
const businessStrategy = {
  ko: {
    title: 'B2B를 기반으로 한 확장형 비즈니스 모델',
    b2b: {
      title: 'B2B: 제도 활용 안정적 수익 기반 마련 가능',
      description: '소나버스(제조) → 복지용품 유통(유통) → 시니어(사용자)',
      advantages: [
        '한국의 경우 복지용구 제도를 통해 85~100% 할인 가능\n(수동형 4만5천원, 하이브리드 10만5천원)',
        '전국 복지용구 사업장 약 2,100개',
        '노인장기요양보험 등급자 약 120만 명'
      ]
    },
    b2c: {
      title: 'B2C: 프리미엄 브랜딩 확장 전략',
      description: '일반 소비자 직접 판매 방식',
      advantages: [
        '기존 온라인 구매 고객 및 해외 고객',
        '프리미엄 브랜딩, 퍼포먼스',
        '부품 교체, A/S 관리 등 유지보수 서비스',
        '한정적 시장 규모에서 벗어나 확장 가능'
      ]
    },
    profitability: {
      title: '만보 (하이브리드형) 수익성',
      price: '700,000원',
      cost: '250,000원',
      profit: '230,000원',
      margin: '33%'
    }
  },
  en: {
    title: 'Scalable Business Model Based on B2B',
    b2b: {
      title: 'B2B: Stable Revenue Base Through System Utilization',
      description: 'Sonaverse (Manufacturing) → Welfare Product Distribution → Seniors (Users)',
      advantages: [
        'In Korea, 85-100% discount available through welfare equipment system (Manual 45,000 KRW, Hybrid 105,000 KRW)',
        'Approximately 2,100 welfare equipment businesses nationwide',
        'Approximately 1.2 million long-term care insurance recipients'
      ]
    },
    b2c: {
      title: 'B2C: Premium Branding Expansion Strategy',
      description: 'Direct consumer sales approach',
      advantages: [
        'Existing online customers and overseas customers',
        'Premium branding and performance',
        'Parts replacement and A/S maintenance services',
        'Expansion beyond limited market size'
      ]
    },
    profitability: {
      title: 'Manbo (Hybrid) Profitability',
      price: '700,000 KRW',
      cost: '250,000 KRW',
      profit: '230,000 KRW',
      margin: '33%'
    }
  }
};

const HomePage: React.FC = () => {
  const { language, isClient } = useLanguage();
  
  // 년도별 그라데이션 색상 계산 함수 (회사 연혁 페이지와 동일)
  const getYearColor = (index: number, total: number) => {
    // 가장 마지막 년도(최신)가 가장 진한 #0B3877
    // 가장 첫 번째 년도(오래된)가 가장 연한 색상
    const baseColor = 0x0B3877;
    const r = (baseColor >> 16) & 0xFF; // 11
    const g = (baseColor >> 8) & 0xFF;  // 56
    const b = baseColor & 0xFF;         // 119
    
    // 인덱스를 역순으로 계산 (마지막이 1.0, 첫번째가 0.2로 시작하여 점진적으로 진해짐)
    const intensity = 0.2 + (0.8 * (index / (total - 1)));
    
    // RGB 각각에 intensity 적용
    const newR = Math.round(r + (255 - r) * (1 - intensity));
    const newG = Math.round(g + (255 - g) * (1 - intensity));
    const newB = Math.round(b + (255 - b) * (1 - intensity));
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  // 배경색 대비에 따라 텍스트 색상을 자동으로 선택 (흰/검)
  const getAccessibleTextColor = (rgbString: string): string => {
    const match = rgbString.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (!match) return '#000000';
    const r = parseInt(match[1], 10) / 255;
    const g = parseInt(match[2], 10) / 255;
    const b = parseInt(match[3], 10) / 255;
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const R = toLinear(r);
    const G = toLinear(g);
    const B = toLinear(b);
    const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    const contrastWhite = 1.05 / (L + 0.05);
    const contrastBlack = (L + 0.05) / 0.05;
    return contrastWhite >= contrastBlack ? '#ffffff' : '#000000';
  };
  
  // JSON-LD 구조화된 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SONAVERSE',
    alternateName: '소나버스',
    url: 'https://sonaverse.kr',
    logo: 'https://sonaverse.kr/logo/symbol_logo.png',
    description: '시니어의 더 나은 내일을 위한 혁신적인 헬스케어 솔루션을 제공하는 기업',
    foundingDate: '2022',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR'
    },
    sameAs: [],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '소나버스 제품',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: '만보 워크메이트',
            description: '하이브리드형 워크메이트로 경사지 제어 기능과 실종 방지 기능을 갖춘 혁신적인 보행 보조기',
            brand: {
              '@type': 'Brand',
              name: 'SONAVERSE'
            }
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: '보듬 기저귀',
            description: '프리미엄 성인용 기저귀로 안심할 수 있는 코어 설계와 천연 펄프를 사용한 고품질 제품',
            brand: {
              '@type': 'Brand',
              name: 'SONAVERSE'
            }
          }
        }
      ]
    }
  };
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState<any>({});
  const [pressData, setPressData] = useState<PressRelease[]>([]);
  const [blogData, setBlogData] = useState<SonaverseStory[]>([]);
  const [brandStoryData, setBrandStoryData] = useState<any[]>([]);
  // 모바일 제품 캐러셀
  const mobileProductsRef = useRef<HTMLDivElement | null>(null);
  
  // 더보기 기능을 위한 상태
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  // 소나버스 스토리 슬라이딩을 위한 상태
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isStoryDragging, setIsStoryDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: any[]) => {
        // 배치 업데이트로 레이아웃 스래싱 방지
        const visibleIds: Record<string, boolean> = {};
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target && (entry.target as HTMLElement).id) {
            visibleIds[(entry.target as HTMLElement).id] = true;
          }
        }
        if (Object.keys(visibleIds).length) {
          requestAnimationFrame(() => {
            setIsVisible((prev: any) => ({ ...prev, ...visibleIds }));
          });
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -10% 0px' }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    // API 호출을 병렬로 처리하여 성능 향상
    const fetchData = async () => {
      try {
        const [pressRes, storiesRes] = await Promise.all([
          fetch('/api/press?pageSize=6&active=true'),
          fetch('/api/sonaverse-story?limit=6&published=true')
        ]);

        // Press 데이터 처리
        const pressData = await pressRes.json();
        requestAnimationFrame(() => setPressData(pressData.results || []));

        // Stories 데이터 처리
        const storiesData = await storiesRes.json();
        const allStories = storiesData.results || [];
        
        // 메인 게시물을 첫 번째로 정렬
        const sortedStories = allStories.sort((a: SonaverseStory, b: SonaverseStory) => {
          if (a.is_main && !b.is_main) return -1;
          if (!a.is_main && b.is_main) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        // 소나버스 스토리 데이터로 설정
        requestAnimationFrame(() => setBlogData(sortedStories));
        
        // 같은 소나버스 스토리 데이터를 다른 섹션용으로 변환
        const sonaverseStories = sortedStories.map((story: any) => {
          const content = story.content?.[language] || story.content?.ko || story.content?.en;
          
          return {
            slug: story.slug,
            title: content?.title || 'No Title',
            subtitle: content?.subtitle || 'No Subtitle',
            date: new Date(story.published_date || story.created_at).toLocaleDateString('ko-KR'),
            thumbnail_url: content?.thumbnail_url || '/logo/nonImage_logo.png',
            body: content?.body || 'No content available',
            youtube_url: story.youtube_url
          };
        });
        
        requestAnimationFrame(() => setBrandStoryData(sonaverseStories));
      } catch (err) {
        console.error('Error fetching data:', err);
        requestAnimationFrame(() => {
          setPressData([]);
          setBlogData([]);
          setBrandStoryData([]);
        });
      }
    };

    fetchData();
  }, [language]);


  // 자동 슬라이딩 useEffect
  useEffect(() => {
    if (blogData.length <= 2 || isHovered || isStoryDragging) return; // 게시물이 2개 이하거나 호버/드래그 중이면 자동 슬라이딩 중지

    const maxSlide = Math.max(0, blogData.length - 3); // 메인 제외하고 남은 게시물에서 2개씩 보이므로
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev >= maxSlide) {
          return 0; // 마지막 슬라이드에서 첫 번째로 돌아가기
        }
        return prev + 1;
      });
    }, 2000); // 2초마다 슬라이드

    return () => clearInterval(interval);
  }, [blogData.length, isHovered, isStoryDragging]);

  const content: any = heroContent[language];
  const problems: any = problemsToSolve[language];
  const manbo: any = manboDetails[language];
  const bodeum: any = bodeumDetails[language];
  const history: any = companyHistory[language];
  const business: any = businessStrategy[language];

  // 슬라이딩 핸들러 함수들
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsStoryDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isStoryDragging) return;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isStoryDragging) return;
    setIsStoryDragging(false);
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const threshold = 50; // 최소 드래그 거리

    requestAnimationFrame(() => {
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsStoryDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isStoryDragging) return;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isStoryDragging) return;
    setIsStoryDragging(false);
    
    const endX = e.clientX;
    const diffX = startX - endX;
    const threshold = 50;

    requestAnimationFrame(() => {
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    });
  };

  const nextSlide = () => {
    const maxSlide = Math.max(0, blogData.length - 3); // 첫 번째는 메인, 나머지에서 2개씩 보이므로
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  // Auto-sliding Carousel component
  const ContentCarousel = ({ items, type }: { items: (SonaverseStory | PressRelease | Product)[]; type: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    // Auto-slide functionality
    useEffect(() => {
      if (!items || items.length <= 3 || isHovered) return;
      
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.max(1, items.length - 2));
      }, 3000); // Slide every 3 seconds
      
      return () => clearInterval(interval);
    }, [items, isHovered]);

    if (!items || items.length === 0) {
      return (
        <div className="text-center py-6 lg:py-12">
          <p className="text-gray-500">{language === 'ko' ? '콘텐츠를 불러오는 중...' : 'Loading content...'}</p>
        </div>
      );
    }

    return (
      <div 
        className="relative will-change-transform"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
          >
            {items.map((item: any, idx: any) => {
              // 브랜드 스토리 타입일 때는 이미 처리된 데이터 사용
              if (type === 'sonaverse-story') {
                const thumbnailUrl = item.thumbnail_url || '/logo/nonImage_logo.png';
                const title = item.title || 'No Title';
                const description = item.subtitle || 'No description available';
                
                return (
                  <div key={idx} className="w-1/3 flex-shrink-0 px-3">
                    <div 
                      onClick={() => window.location.href = `/sonaverse-story/${item.slug}`}
                      className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 h-full cursor-pointer"
                    >
                      <Image 
                        src={thumbnailUrl}
                        alt={`${title} - 소나버스 스토리 썸네일`}
                        width={320}
                        height={160}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                        loading="lazy"
                        sizes="(max-width: 640px) 145px, 320px"
                        onError={() => {}}
                      />
                      <h3 className="text-lg font-bold mb-2 text-slate-800 line-clamp-2">
                        {title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 max-w-xs">
                        {description}
                      </p>
                      <div className="flex justify-start items-center text-xs text-gray-500">
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // 다른 타입들 (블로그, 언론보도 등)은 기존 방식 사용
              const itemContent = item.content?.[language] || item.content?.ko || item.content?.en || item;
              const thumbnailUrl = itemContent.thumbnail_url || item.thumbnail || '/logo/nonImage_logo.png';
              const title = itemContent.title || item.title || 'No Title';
              const description = itemContent.subtitle || item.summary || item.excerpt || item.description || 'No description available';
              
              return (
                <div key={idx} className="w-1/3 flex-shrink-0 px-3">
                  <div 
                    onClick={() => window.location.href = `/${type}/${item.slug}`}
                    className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 h-full cursor-pointer"
                  >
                    <Image 
                      src={thumbnailUrl}
                      alt={title}
                      width={320}
                      height={160}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                      loading="lazy"
                      sizes="(max-width: 640px) 145px, 320px"
                    />
                    <h3 className="text-lg font-bold mb-2 text-slate-800 line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 max-w-xs">
                      {description}
                    </p>
                    <div className="flex justify-start items-center text-xs text-gray-500">
                      <span>{new Date(item.published_date || item.created_at || item.createdAt || Date.now()).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full bg-white">
      {/* Hero Section - 전체화면 (Next/Image로 LCP 최적화) */}
      <section 
        id="hero" 
        data-section 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        {/* 배경 이미지 */}
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt=""
            fill
            priority
            fetchPriority="high"
            quality={70}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
          <div className={`transform transition-all duration-1000 ${isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              {content.headline}
              <br />
              <span className="text-[#bda191] text-2xl sm:text-4xl md:text-6xl">{content.subheadline}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-slate-200 font-light">
              {content.description.split('\n').map((line: string, i: number, arr: string[]) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
            
            {/* CTA 버튼 */}
            <div className="flex flex-row gap-2 sm:gap-4 justify-center mb-12 sm:mb-16">
              <button 
                onClick={() => {
                  const productsSection = document.getElementById('products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 py-2 sm:px-8 sm:py-4 bg-[#EFD1BD] text-gray-900 rounded-xl font-semibold hover:bg-[#e8c4a4] transition-all duration-300 shadow-lg text-xs sm:text-base flex-1 border border-[#e8c4a4]"
              >
{language === 'en' ? 'Explore Products' : '제품 둘러보기'}
              </button>
              <button 
                onClick={() => window.location.href = '/inquiry'}
                className="px-4 py-2 sm:px-8 sm:py-4 bg-[#0B3877] text-white rounded-xl font-semibold hover:bg-[#092f66] transition-all duration-300 shadow-lg text-xs sm:text-base flex-1"
              >
{language === 'en' ? 'Contact Us' : '문의하기'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 문제 정의 섹션 - 지그재그 레이아웃 */}
      <section 
        id="problems" 
        data-section 
        className="py-8 sm:py-14 lg:py-20 bg-white relative overflow-hidden"
      >
        <h2 className="sr-only">{language === 'en' ? 'Problems We Aim to Solve' : '우리가 해결하고자 하는 문제들'}</h2>
        {/* 배경 장식 요소 */}
        <div className="absolute top-0 right-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-[#bda191]/5 rounded-full -translate-y-24 sm:-translate-y-36 lg:-translate-y-48 translate-x-24 sm:translate-x-36 lg:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-36 sm:w-56 lg:w-72 h-36 sm:h-56 lg:h-72 bg-slate-100 rounded-full translate-y-18 sm:translate-y-28 lg:translate-y-36 -translate-x-18 sm:-translate-x-28 lg:-translate-x-36"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="hidden" />
          
          {/* 지그재그 레이아웃 */}
          <div className="space-y-16 sm:space-y-20 lg:space-y-32">
            {problems.map((problem: any, idx: number) => (
              <div 
                key={idx} 
                className=""
              >
                <div className={`flex flex-col lg:flex-row items-center ${[1,3].includes(idx) ? 'gap-6 lg:gap-4' : 'gap-12'} ${
                  idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}>
                  {/* 아이콘 영역 */}
                  <div className="flex-shrink-0">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#bda191] to-[#a68b7a] rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-500">
                        <Image src={problem.icon} alt={`${problem.title} 문제 해결 아이콘`} width={56} height={56} className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain" loading="lazy" sizes="(max-width: 640px) 35px, 56px" />
                      </div>
                  </div>
                  
                  {/* 텍스트 영역 */}
                  <div className={`flex-1 text-center ${idx % 2 === 0 ? 'lg:text-left' : 'lg:text-right lg:flex lg:flex-col lg:items-end'}`}>
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mb-4 text-slate-900 leading-tight">
                      {problem.title}
                    </h3>
                    <p className={`text-lg text-slate-600 leading-relaxed whitespace-pre-line ${[1,3].includes(idx) ? (idx === 3 ? 'max-w-none lg:whitespace-pre-line' : 'max-w-none lg:whitespace-nowrap') : 'max-w-2xl'}`}>
                      {problem.description}
                    </p>
                    {/* 데코레이션 라인 */}
                    <div className={`mt-6 h-1 w-20 bg-[#bda191] ${idx % 2 === 0 ? 'lg:ml-0' : 'lg:ml-auto'} mx-auto lg:mx-0`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 제품 섹션 (만보 + 보듬 통합) */}
      <section id="products" data-section className="py-16 lg:py-20 bg-white">
        <h2 className="sr-only">{language === 'en' ? 'Products' : '제품'}</h2>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile horizontal scroll */}
          <div className="lg:hidden">
            <div
              ref={mobileProductsRef}
              className="-mx-4 px-4 overflow-x-auto flex gap-0 snap-x snap-mandatory"
              style={{ 
                scrollbarWidth: 'none' as any, 
                msOverflowStyle: 'none' as any
              }}
            >
            <style jsx>{`
              #products div::-webkit-scrollbar{display:none}
            `}</style>
            <div id="manbo" className="snap-center group bg-white rounded-3xl shadow-lg border border-slate-200 p-5 flex-shrink-0 mr-4 flex flex-col h-full" style={{ width: 'calc(100% - 2rem)', minHeight: '400px' }}>
              <div className="mb-4">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{manbo.title}</h2>
                <p className="text-base text-gray-600">{manbo.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {manbo.description.split('\n').map((line: string, i: number, arr: string[]) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                  <h3 className="text-base font-semibold my-3 text-gray-900">{language === 'en' ? 'Key Features' : '주요 특징'}</h3>
                  <ul className="space-y-2">
                    {manbo.features.slice(0,5).map((feature: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-[#1C4376] rounded-full mt-2"></span>
                        <span className="text-sm text-gray-900">{feature.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-center">
                  <Image src="/product/manbo/pd_manbo_main.png" alt="만보" className="w-full h-40 object-contain" loading="lazy" decoding="async" width={320} height={160} />
                </div>
              </div>
              <div className="flex gap-2 justify-center mt-auto">
                <button onClick={() => window.location.href = '/products/manbo-walker'} className="h-10 px-3 bg-[#1C4376] text-white rounded-lg text-xs sm:text-sm flex-1">{language === 'en' ? 'View Details' : '자세히 보기'}</button>
                <button onClick={() => window.location.href = '/inquiry'} className="h-10 px-3 border border-[#1C4376] text-[#1C4376] rounded-lg text-xs sm:text-sm flex-1">{language === 'en' ? 'Inquiry' : '사전 문의'}</button>
              </div>
            </div>
            <div id="bodeum" className="snap-center group bg-white rounded-3xl shadow-lg border border-slate-200 p-5 flex-shrink-0 flex flex-col h-full" style={{ width: 'calc(100% - 2rem)', minHeight: '400px' }}>
              <div className="mb-4">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{bodeum.title}</h2>
                <p className="text-base text-gray-600">{bodeum.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {bodeum.description.split('\n').map((line: string, i: number, arr: string[]) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                  <h3 className="text-base font-semibold my-3 text-gray-900">{language === 'en' ? 'Key Features' : '주요 특징'}</h3>
                  <ul className="space-y-2">
                    {bodeum.features.slice(0,5).map((feature: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-[#EFD1BD] rounded-full mt-2"></span>
                        <span className="text-sm text-gray-900">{feature.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-center">
                  <Image src="/product/bodume/main_section_diapers.jpg" alt="보듬" className="w-full h-40 object-contain" loading="lazy" decoding="async" width={320} height={160} />
                </div>
              </div>
              <div className="flex gap-2 justify-center mt-auto">
                <button onClick={() => window.location.href = '/products/bodeum-diaper'} className="h-10 px-3 bg-[#EFD1BD] text-gray-900 rounded-lg text-xs sm:text-sm flex-1">{language === 'en' ? 'View Details' : '자세히 보기'}</button>
                <button onClick={() => window.open('https://bodume.com/', '_blank')} className="h-10 px-3 border border-[#EFD1BD] text-gray-800 rounded-lg text-xs sm:text-sm flex-1">{language === 'en' ? 'Online Purchase' : '온라인 구매'}</button>
              </div>
            </div>
            </div>
          </div>

          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-stretch">
            {/* 만보 컬럼 */}
            <div id="manbo" className="group bg-white rounded-3xl shadow-lg border border-slate-200 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
              <div className="sm:mb-8">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">{manbo.title}</h2>
                <p className="text-lg text-gray-600">{manbo.subtitle}</p>
              </div>
              <div className="grid md:grid-cols-2 items-start gap-6 mb-8">
                <div className="flex flex-col">
                  <div className="prose prose-lg mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {manbo.description.split('\n').map((line: string, i: number, arr: string[]) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">{language === 'en' ? 'Key Features' : '주요 특징'}</h3>
                  <div className="space-y-3">
                    {manbo.features.map((feature: any, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 py-2">
                        <div className="flex-shrink-0 w-2 h-2 bg-[#1C4376] rounded-full mt-2"></div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">{feature.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start justify-center pt-2">
                  <Image
                    src="/product/manbo/pd_manbo_main.png"
                    alt="만보 워크메이트 - 하이브리드 보행보조기 제품 이미지"
                    className="w-[250px] h-[250px] object-contain rounded-lg shadow-lg"
                    loading="lazy"
                    width={250}
                    height={250}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-center mt-auto">
                <button 
                  onClick={() => window.location.href = '/products/manbo-walker'}
                  className="inline-flex items-center justify-center h-10 sm:h-12 px-4 sm:px-6 bg-[#1C4376] text-white rounded-lg font-medium hover:bg-[#153760] transition-colors text-xs sm:text-sm min-w-[120px] sm:min-w-[140px]"
                >
                  {language === 'en' ? 'View Details' : '자세히 보기'}
                </button>
                <button 
                  onClick={() => window.location.href = '/inquiry'}
                  className="inline-flex items-center justify-center h-10 sm:h-12 px-4 sm:px-6 border border-[#1C4376] text-[#1C4376] rounded-lg font-medium hover:bg-[#1C4376]/10 transition-colors text-xs sm:text-sm min-w-[120px] sm:min-w-[140px]"
                >
                  {language === 'en' ? 'Inquiry' : '사전 문의'}
                </button>
              </div>
            </div>

            {/* 보듬 컬럼 */}
            <div id="bodeum" className="group bg-white rounded-3xl shadow-lg border border-slate-200 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
              <div className="sm:mb-8">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">{bodeum.title}</h2>
                <p className="text-lg text-gray-600">{bodeum.subtitle}</p>
              </div>
              <div className="grid md:grid-cols-2 items-start gap-6 mb-8">
                <div className="flex flex-col">
                  <div className="prose prose-lg mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {bodeum.description.split('\n').map((line: string, i: number, arr: string[]) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">{language === 'en' ? 'Key Features' : '주요 특징'}</h3>
                  <div className="space-y-3">
                    {bodeum.features.map((feature: any, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 py-2">
                        <div className="flex-shrink-0 w-2 h-2 bg-[#EFD1BD] rounded-full mt-2"></div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900">{feature.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start justify-center pt-2">
                  <Image
                    src="/product/bodume/main_section_diapers.jpg"
                    alt="보듬 기저귀 - 프리미엄 성인용 기저귀 제품 이미지"
                    className="w-[250px] h-[250px] object-contain rounded-lg shadow-lg"
                    loading="lazy"
                    width={250}
                    height={250}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-center mt-auto">
                <button 
                  onClick={() => window.location.href = '/products/bodeum-diaper'}
                  className="inline-flex items-center justify-center h-10 sm:h-12 px-4 sm:px-6 bg-[#EFD1BD] text-gray-900 rounded-lg font-medium hover:bg-[#e8c4a4] transition-colors text-xs sm:text-sm min-w-[120px] sm:min-w-[140px]"
                >
                  {language === 'en' ? 'View Details' : '자세히 보기'}
                </button>
                <button 
                  onClick={() => window.open('https://bodume.com/', '_blank')}
                  className="inline-flex items-center justify-center h-10 sm:h-12 px-4 sm:px-6 border border-[#EFD1BD] text-gray-800 rounded-lg font-medium hover:bg-[#EFD1BD]/20 transition-colors text-xs sm:text-sm min-w-[120px] sm:min-w-[140px]"
                >
                  {language === 'en' ? 'Online Purchase' : '온라인 구매'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 소나버스 스토리 섹션 */}
      <section 
        id="blog" 
        data-section 
        className="py-6 lg:py-20 bg-white relative overflow-hidden"
      >
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-xl sm:text-3xl md:text-5xl font-bold mb-4 text-slate-800">
{language === 'en' ? 'SONAVERSE Story' : '소나버스 스토리'}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
{language === 'en' ? 'Discover SONAVERSE\'s innovation journey and deep insights into senior life' : '소나버스의 혁신 여정과 시니어 라이프에 대한 깊이 있는 통찰을 만나보세요'}
            </p>
          </div>
          
          <div className="">
            {blogData.length === 0 ? (
              <div className="text-center py-6 lg:py-12">
                <p className="text-gray-500">{language === 'ko' ? '블로그 포스트를 불러오는 중...' : 'Loading blog posts...'}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 대형 카드 1개만 표시 */}
                {blogData.length > 0 && (() => {
                  const mainPost = blogData[0];
                  const itemContent = mainPost.content?.[language] || mainPost.content?.ko || mainPost.content?.en || mainPost;
                  const title = itemContent.title || mainPost.title || 'No Title';
                  const description = itemContent.subtitle || mainPost.summary || mainPost.excerpt || 'No description available';
                  const thumbnailUrl = itemContent.thumbnail_url || mainPost.thumbnail || '/logo/nonImage_logo.png';
                  const date = new Date(mainPost.published_date || mainPost.created_at || Date.now()).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
                  
                  return (
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                      {/* 이미지 영역 */}
                      <div className="lg:w-1/2 relative">
                        <div 
                          onClick={() => window.location.href = `/sonaverse-story/${mainPost.slug}`}
                          className="group relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer transform hover:-translate-y-2 transition-all duration-500"
                        >
                          <div className="aspect-[4/3] relative">
                            <Image 
                              src={thumbnailUrl}
                              alt={title}
                              width={640}
                              height={480}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              loading="lazy"
                              sizes="(max-width: 1024px) 100vw, 640px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/70 transition-all duration-500"></div>
                          </div>
                          
                          {/* 호버 오버레이 */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
                              <span className="text-slate-800 font-semibold">
                                {language === 'ko' ? '포스트 보기' : 'View Post'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                      </div>
                      
                      {/* 콘텐츠 영역 */}
                      <div className="lg:w-1/2 text-center lg:text-left">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 backdrop-blur-lg">
                          {/* 날짜 배지 */}
                          <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-semibold mb-4">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {date}
                          </div>
                          
                          {/* 제목 */}
                          <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800 mb-4 leading-tight">
                            {title}
                          </h3>
                          
                          {/* 부제목 */}
                          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            {description}
                          </p>
                          
                          {/* 콘텐츠 디스크립션 */}
                          {itemContent.body && (
                            <div className="text-gray-700 leading-relaxed mb-6">
                              <p 
                                className="text-sm overflow-hidden"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 4,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: '1.6',
                                  maxHeight: '6.4em'
                                }}
                              >
                                {itemContent.body.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* 더 많은 포스트 영역 - 문구 없이 표시 */}
                {blogData.length > 1 && (
                  <div className="mt-12">
                    <div className="bg-white">
                      {/* 데스크톱: 기존 그리드 */}
                      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
                        {blogData.slice(1, 4).map((post: SonaverseStory, idx: number) => {
                          const itemContent = post.content?.[language] || post.content?.ko || post.content?.en || post;
                          const title = itemContent.title || post.title || 'No Title';
                          const description = itemContent.subtitle || post.summary || post.excerpt || 'No description available';
                          const thumbnailUrl = itemContent.thumbnail_url || post.thumbnail || '/logo/nonImage_logo.png';
                          const date = new Date(post.published_date || post.created_at || Date.now()).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
                          
                          return (
                            <div 
                              key={idx}
                              onClick={() => window.location.href = `/sonaverse-story/${post.slug}`}
                              className="group bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100"
                            >
                              <div className="h-full flex flex-col">
                                {/* 이미지 영역 */}
                                <div className="w-full h-32 bg-gradient-to-br from-rose-400 to-pink-500 rounded-t-2xl flex-shrink-0 overflow-hidden">
                                  <Image 
                                    src={thumbnailUrl}
                                    alt={title}
                                    width={320}
                                    height={128}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    sizes="(max-width: 1024px) 100vw, 320px"
                                  />
                                </div>
                                
                                {/* 텍스트 영역 */}
                                <div className="flex-1 flex flex-col px-6 pb-6 pt-4">
                                  <h5 className="text-sm font-semibold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors duration-300 line-clamp-2 leading-tight">
                                    {title}
                                  </h5>
                                  <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed flex-1">
                                    {description}
                                  </p>
                                  <div className="text-xs text-gray-500 mt-auto">{date}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 모바일/태블릿: 슬라이딩 */}
                      <div 
                        className="lg:hidden overflow-hidden"
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
                          {blogData.slice(1).map((post: SonaverseStory, idx: number) => {
                            const itemContent = post.content?.[language] || post.content?.ko || post.content?.en || post;
                            const title = itemContent.title || post.title || 'No Title';
                            const description = itemContent.subtitle || post.summary || post.excerpt || 'No description available';
                            const thumbnailUrl = itemContent.thumbnail_url || post.thumbnail || '/logo/nonImage_logo.png';
                            const date = new Date(post.published_date || post.created_at || Date.now()).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
                            
                            return (
                              <div 
                                key={idx}
                                className="flex-none w-1/2 px-2"
                              >
                                <div
                                  onClick={() => window.location.href = `/sonaverse-story/${post.slug}`}
                                  className="group bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 h-full"
                                >
                                  <div className="h-full flex flex-col">
                                    {/* 이미지 영역 */}
                                    <div className="w-full h-32 bg-gradient-to-br from-rose-400 to-pink-500 rounded-t-2xl flex-shrink-0 overflow-hidden">
                                      <Image 
                                        src={thumbnailUrl}
                                        alt={title}
                                        width={320}
                                        height={128}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        sizes="(max-width: 640px) 145px, 320px"
                                      />
                                    </div>
                                    
                                    {/* 텍스트 영역 */}
                                    <div className="flex-1 flex flex-col px-6 pb-6 pt-4">
                                      <h5 className="text-sm font-semibold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors duration-300 line-clamp-2 leading-tight">
                                        {title}
                                      </h5>
                                      <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed flex-1">
                                        {description}
                                      </p>
                                      <div className="text-xs text-gray-500 mt-auto">{date}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* 슬라이딩 인디케이터 */}
                        {blogData.length > 3 && (
                          <div className="flex justify-center mt-6 space-x-2">
                            {Array.from({ length: Math.max(0, blogData.length - 2) }).map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                  index === currentSlide ? 'bg-rose-500' : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 하단 액션 */}
            <div className="text-center mt-12">
              <button 
                onClick={() => window.location.href = '/sonaverse-story'}
                className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-slate-800 text-white rounded-2xl font-semibold hover:bg-slate-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
{language === 'en' ? 'Visit SONAVERSE Stories' : '소나버스 이야기 보러가기'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* 회사 연혁 섹션 - 타임라인 형식 */}
      <section 
        id="history" 
        data-section 
        className="py-6 lg:py-20 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden"
      >
        {/* 배경 장식 요소 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#bda191]/5 rounded-full -translate-y-48 translate-x-48"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* 섹션 헤더 */}
          <div className="text-center mb-8 lg:mb-20">
            <h2 className="text-lg sm:text-4xl md:text-5xl font-bold mb-6 text-slate-900">
{language === 'en' ? 'SONAVERSE Growth Journey' : '소나버스의 성장 여정'}
            </h2>
            <p className="text-sm sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
{language === 'en' ? 'Continuing steady growth since establishment in 2022.' : '2022년 설립 이후 지속적인 성장을 이어가고 있습니다.'}
            </p>
          </div>
          
          {/* 연혁 타임라인 */}
          <div className="relative mb-8">
            {/* 중앙 수직 라인 */}
            <div
              className="absolute left-1/2 transform -translate-x-px top-0 bottom-0 w-0.5"
              style={{ backgroundColor: getYearColor(history.length - 1, history.length) }}
            ></div>
            
            <div className="space-y-12 md:space-y-20">
              {(showFullHistory ? history : history.slice(0, 2)).map((item: any, idx: number) => {
                // 전체 history에서 현재 item의 실제 인덱스를 찾아서 색상 일관성 보장
                const originalIndex = history.findIndex((histItem: any) => histItem.year === item.year);
                return (
                <div 
                  key={idx} 
                  className="relative group"
                >
                  {/* 중앙 년도 원형 배지 - 콘텐츠 위에 표시되도록 */}
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 -translate-y-4 md:-translate-y-4 w-12 h-12 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl z-30 border-2 md:border-4 border-white transition-all duration-500"
                    style={{ backgroundColor: getYearColor(originalIndex, history.length) }}
                  >
                    {(() => {
                      const bg = getYearColor(originalIndex, history.length);
                      const textColor = getAccessibleTextColor(bg);
                      return (
                        <span className="year-badge-text font-bold text-xs md:text-xl" style={{ color: textColor }}>{item.year}</span>
                      );
                    })()}
                  </div>
                  
                  
                  {/* 콘텐츠 카드 - 년도와 겹치지 않도록 좌우/상하 여백 조정 */}
                  <div className={`${idx % 2 === 0 ? 'md:w-10/19 md:ml-auto md:mr-0' : 'md:w-10/19 md:mr-auto md:ml-0'} relative`} style={{ paddingTop: '40px' }}>
                    <div className={`bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 p-4 md:p-8 transition-all duration-500 transform group-hover:shadow-2xl group-hover:-translate-y-2 ${idx % 2 === 0 ? 'md:text-left md:ml-20 lg:ml-24' : 'md:text-right md:mr-20 lg:mr-24'} relative z-20`}>
                      {/* 제목과 설명 */}
                      <div className="mb-4 md:mb-6">
                        <h3 className="text-base sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-4 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-xs md:text-lg text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      
                      {/* 주요 이벤트들 */}
                      {item.events && Array.isArray(item.events) && (
                        <div className="space-y-3 md:space-y-4">
                          {/* 제목 제거: '주요 성과' / 'Key Achievements' */}
                          
                          <div className="space-y-1.5 md:space-y-3">
                            {item.events.map((event: string, eventIdx: number) => (
                              <div 
                                key={eventIdx} 
                                className={`flex items-start ${idx % 2 === 0 ? 'text-left flex-row' : 'text-left flex-row md:text-right md:flex-row-reverse'}`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mt-2 md:mt-5 flex-shrink-0 ${idx % 2 === 0 ? 'mr-1.5 md:mr-4' : 'mr-1.5 md:ml-4 md:mr-0'}`}
                                  style={{ backgroundColor: getYearColor(history.length - 1, history.length) }}
                                ></div>
                                <div className="flex-1">
                                  <p className={`text-slate-700 leading-relaxed font-medium bg-slate-50 rounded-lg p-1.5 md:p-4 hover:bg-slate-100 transition-colors duration-200 text-[10px] md:text-base text-left ${idx % 2 === 0 ? '' : 'md:text-right'}`}>
                                    {event}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            
            {/* 마지막 년도 이후 계속되는 여정 */}
            {showFullHistory && (
              <div className="relative mt-12 md:mt-20">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center shadow-xl z-30 border-2 md:border-4 border-white">
                  <span className="text-white font-bold text-sm md:text-2xl">∞</span>
                </div>
                
                <div className="pt-6 md:pt-8 text-center">
                  <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#bda191] to-[#a68b7a] rounded-2xl md:rounded-3xl p-4 md:p-10 text-white shadow-2xl">
                    <h4 className="text-base md:text-3xl font-bold mb-3 md:mb-6">
  {language === 'en' ? 'Continuing Journey' : '계속되는 여정'}
                    </h4>
                    <p className="text-xs md:text-xl leading-relaxed opacity-95">
{language === 'en' ? 'SONAVERSE\'s challenge for senior life innovation continues.' : '시니어 라이프 혁신을 위한 소나버스의 도전은 계속됩니다.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 더보기 버튼 */}
          {history.length > 2 && (
            <div className="text-center">
              <button 
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="bg-gray-900 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center text-xs sm:text-base"
              >
                {showFullHistory 
                  ? (language === 'ko' ? '간단히 보기' : 'Show Less')
                  : (language === 'ko' ? '전체 연혁 보기' : 'View Full History')
                }
                <svg className={`ml-2 w-4 h-4 transform transition-transform ${showFullHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 언론보도 섹션 */}
      <section 
        id="press" 
        data-section 
        className="py-6 lg:py-20 bg-white relative overflow-hidden"
      >
        <h2 className="sr-only">{language === 'en' ? 'Press Coverage' : '언론보도'}</h2>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-xl sm:text-3xl md:text-5xl font-bold mb-4 text-slate-800">
{language === 'en' ? 'Press Coverage' : '언론보도'}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
{language === 'en' ? 'Check out SONAVERSE news and major stories covered in the media' : '소나버스의 소식과 언론에서 다룬 주요 뉴스를 확인해보세요'}
            </p>
          </div>
          
          <div className="">
            {pressData.length === 0 ? (
              <div className="text-center py-6 lg:py-12">
                <p className="text-gray-500">{language === 'ko' ? '언론보도를 불러오는 중...' : 'Loading press releases...'}</p>
              </div>
            ) : (
              <>
                {/* 데스크톱 레이아웃 */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                {/* 메인 언론보도 (첫 번째) */}
                {pressData.length > 0 && (
                  <div className="lg:col-span-2">
                    {(() => {
                      const mainPress = pressData[0];
                      const itemContent = mainPress.content?.[language] || mainPress.content?.ko || mainPress.content?.en || mainPress;
                      const title = itemContent.title || 'No Title';
                      const description = itemContent.body ? itemContent.body.replace(/<[^>]*>/g, '').slice(0, 200) + '...' : 'No description available';
                      const pressName = typeof mainPress.press_name === 'object' && mainPress.press_name
                        ? (mainPress.press_name[language] || mainPress.press_name.ko || mainPress.press_name.en || '')
                        : (mainPress.press_name || '소나버스');
                      const thumbnailUrl = mainPress.thumbnail || '/logo/nonImage_logo.png';
                      const date = new Date(mainPress.published_date || mainPress.created_at || Date.now()).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
                      
                      return (
                          <div 
                            onClick={() => window.location.href = `/press/${mainPress.slug}`}
                            className="group bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 h-[580px]"
                          >
                            <div className="relative h-72 overflow-hidden">
                              <Image 
                                src={thumbnailUrl}
                                alt={title}
                                width={960}
                                height={432}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                loading="lazy"
                                sizes="(max-width: 1024px) 100vw, 960px"
                              />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                          </div>
                          <div className="p-8 flex flex-col h-80">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
                                </svg>
                                <span>{language === 'ko' ? '언론보도' : 'Press Release'}</span>
                              </div>
                            </div>
                            <h3 className="text-lg sm:text-2xl font-bold text-slate-800 mb-4 group-hover:text-slate-600 transition-colors duration-300 leading-tight">
                              {title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed flex-1 line-clamp-4">
                              {description}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                {/* 사이드 언론보도들 */}
                <div className="flex flex-col h-[580px]">
                  {pressData.slice(1, 4).map((press: any, idx: number) => {
                    const itemContent = press.content?.[language] || press.content?.ko || press.content?.en || press;
                    const title = itemContent.title || press.title || 'No Title';
                    const description = itemContent.body ? itemContent.body.replace(/<[^>]*>/g, '').slice(0, 80) + '...' : 'No description available';
                    const pressName = typeof press.press_name === 'object' && press.press_name
                      ? (press.press_name[language] || press.press_name.ko || press.press_name.en || '')
                      : (press.press_name || '소나버스');
                    const thumbnailUrl = press.thumbnail || '/logo/nonImage_logo.png';
                    const date = new Date(press.published_date || press.created_at || Date.now()).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
                    
                    return (
                      <div 
                        key={idx}
                        onClick={() => window.location.href = `/press/${press.slug}`}
                        className="group bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 flex-1 min-h-0 mb-4 last:mb-0"
                      >
                        <div className="flex h-full">
                          <div className="w-2/5 h-full flex-shrink-0 relative overflow-hidden">
                            <Image 
                              src={thumbnailUrl}
                              alt={title}
                              width={320}
                              height={200}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                              sizes="(max-width: 1024px) 100vw, 320px"
                            />
                          </div>
                          <div className="flex-1 p-4 flex flex-col">
                            <div className="flex items-center mb-2">
                              <span className="text-xs text-gray-500">{date}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-800 mb-2 group-hover:text-slate-600 transition-colors duration-300 line-clamp-2 leading-tight">
                              {title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2 flex-1 leading-relaxed">
                              {description}
                            </p>
                            <div className="text-xs text-slate-500 mt-auto">
                              {pressName}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 모바일/태블릿 레이아웃 - 컴팩트한 리스트 */}
              <div className="lg:hidden space-y-4">
                {pressData.slice(0, 4).map((press: any, idx: number) => {
                  const itemContent = press.content?.[language] || press.content?.ko || press.content?.en || press;
                  const title = itemContent.title || press.title || 'No Title';
                  const description = itemContent.body ? itemContent.body.replace(/<[^>]*>/g, '').slice(0, 80) + '...' : 'No description available';
                  const pressName = typeof press.press_name === 'object' && press.press_name
                    ? (press.press_name[language] || press.press_name.ko || press.press_name.en || '')
                    : (press.press_name || '소나버스');
                  const thumbnailUrl = press.thumbnail || '/logo/nonImage_logo.png';
                  const date = new Date(press.published_date || press.created_at || Date.now()).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => window.location.href = `/press/${press.slug}`}
                      className="group bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex h-full">
                        {/* 왼쪽 썸네일 */}
                        <div className="w-24 flex-shrink-0 bg-gray-200 rounded-l-2xl relative overflow-hidden">
                            <Image 
                              src={thumbnailUrl}
                              alt={title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                              sizes="(max-width: 640px) 96px, 128px"
                            />
                        </div>
                        
                        {/* 오른쪽 콘텐츠 */}
                        <div className="flex-1 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-[#bda191] rounded-full"></div>
                            <span className="text-xs text-[#bda191] font-medium">{language === 'en' ? 'Press' : '언론보도'}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{pressName}</span>
                          </div>
                          
                          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#bda191] transition-colors duration-300">
                            {title}
                          </h3>
                          
                          <div className="flex items-center justify-between">
                            <time className="text-xs text-gray-500">
                              {date}
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
              </>
            )}
            
            {/* 하단 액션 */}
            <div className="text-center mt-12">
              <button 
                onClick={() => window.location.href = '/press'}
                className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-slate-800 text-white rounded-2xl font-semibold hover:bg-slate-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
{language === 'en' ? 'View All Press Coverage' : '모든 언론보도 보기'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      </div>
      
      {/* 맨 위로 스크롤 버튼 */}
      <ScrollToTop />
    </>
  );
};

export default HomePage;
