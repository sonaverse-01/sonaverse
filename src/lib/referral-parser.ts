interface SearchEngineConfig {
  domain: string;
  queryParam: string;
  name: string;
}

// 주요 검색엔진별 설정
const SEARCH_ENGINES: SearchEngineConfig[] = [
  // 네이버
  { domain: 'search.naver.com', queryParam: 'query', name: 'naver' },
  { domain: 'search.naver.com', queryParam: 'sm', name: 'naver' }, // 모바일용
  
  // 구글
  { domain: 'www.google.com', queryParam: 'q', name: 'google' },
  { domain: 'google.com', queryParam: 'q', name: 'google' },
  { domain: 'www.google.co.kr', queryParam: 'q', name: 'google' },
  { domain: 'google.co.kr', queryParam: 'q', name: 'google' },
  
  // 다음
  { domain: 'search.daum.net', queryParam: 'q', name: 'daum' },
  
  // 빙
  { domain: 'www.bing.com', queryParam: 'q', name: 'bing' },
  
  // 야후
  { domain: 'search.yahoo.com', queryParam: 'p', name: 'yahoo' },
  
  // 줌
  { domain: 'search.zum.com', queryParam: 'query', name: 'zum' }
];

export interface ReferralData {
  keyword: string;
  searchEngine: string;
  referrerUrl: string;
}

/**
 * referrer URL에서 검색 키워드를 추출
 */
export function extractSearchKeyword(referrerUrl: string): ReferralData | null {
  if (!referrerUrl) return null;

  try {
    const url = new URL(referrerUrl);
    
    // 검색엔진 매칭
    for (const engine of SEARCH_ENGINES) {
      if (url.hostname.includes(engine.domain) || engine.domain.includes(url.hostname)) {
        // 쿼리 파라미터에서 검색어 추출
        const keyword = url.searchParams.get(engine.queryParam);
        
        if (keyword && keyword.trim()) {
          return {
            keyword: decodeURIComponent(keyword.trim()),
            searchEngine: engine.name,
            referrerUrl
          };
        }
      }
    }

    // 네이버 특별 처리 (sm 파라미터 등)
    if (url.hostname.includes('naver.com')) {
      // 네이버는 다양한 파라미터를 사용할 수 있음
      const possibleParams = ['query', 'sm', 'where', 'ie'];
      for (const param of possibleParams) {
        const keyword = url.searchParams.get(param);
        if (keyword && keyword.trim() && !keyword.startsWith('tab_') && !keyword.startsWith('nexearch')) {
          return {
            keyword: decodeURIComponent(keyword.trim()),
            searchEngine: 'naver',
            referrerUrl
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing referrer URL:', error);
    return null;
  }
}

/**
 * 검색엔진 이름을 한글로 변환
 */
export function getSearchEngineDisplayName(engine: string): string {
  const names: Record<string, string> = {
    'naver': '네이버',
    'google': '구글',
    'daum': '다음',
    'bing': '빙',
    'yahoo': '야후',
    'zum': '줌'
  };
  
  return names[engine] || engine;
}

/**
 * 키워드가 유효한지 검증
 */
export function isValidKeyword(keyword: string): boolean {
  if (!keyword || keyword.trim().length === 0) return false;
  
  // 너무 짧거나 긴 키워드 필터링
  const trimmed = keyword.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  
  // 특수 문자나 URL 같은 것들 필터링
  if (trimmed.startsWith('http') || trimmed.startsWith('www.')) return false;
  
  // 네이버 내부 파라미터 필터링
  if (trimmed.startsWith('tab_') || trimmed.startsWith('nexearch')) return false;
  
  return true;
}