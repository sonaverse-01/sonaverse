/**
 * 간단한 메모리 캐시 유틸리티
 */
class Cache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  /**
   * 캐시에 데이터 저장
   */
  set(key: string, data: any, ttl: number = 300000): void { // 기본 5분
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 캐시에서 데이터 조회
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 캐시에서 데이터 삭제
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 전체 캐시 삭제
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 캐시 크기 조회
   */
  size(): number {
    return this.cache.size;
  }
}

export const cache = new Cache();

/**
 * 캐시 키 생성 유틸리티
 */
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
}

/**
 * 이미지 최적화 유틸리티
 */
export function optimizeImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return url;
  
  // Vercel Blob URL인 경우 최적화 파라미터 추가
  if (url.includes('blob.vercel-storage.com')) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', '80'); // 품질 80%
    
    return `${url}?${params.toString()}`;
  }
  
  return url;
} 