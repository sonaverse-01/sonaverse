# SONAVERSE 홈페이지

SONAVERSE의 공식 홈페이지입니다. Next.js, TypeScript, Tailwind CSS를 기반으로 구축되었으며, 반응형 디자인과 다국어 지원을 제공합니다.

## 🚀 주요 기능

- **반응형 웹 디자인**: 모든 디바이스에서 최적화된 사용자 경험
- **다국어 지원**: 한국어/영어 지원
- **관리자 CMS**: 콘텐츠 관리 시스템
- **제품 소개**: 만보 보행기, 보듬 기저귀 상세 정보
- **블로그 시스템**: 회사 블로그 및 뉴스
- **문의 시스템**: B2B/대량 문의 폼
- **검색 기능**: 사이트 전체 검색
- **이미지 관리**: Vercel Blob을 통한 이미지 업로드

## 🛠 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas
- **Storage**: Vercel Blob
- **Deployment**: Vercel
- **Internationalization**: i18next

## 📁 프로젝트 구조

```
sonaverse-homepage/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # 관리자 페이지
│   │   ├── api/            # API 엔드포인트
│   │   ├── blog/           # 블로그 페이지
│   │   ├── brand-story/    # 브랜드 스토리
│   │   ├── inquiry/        # 문의 페이지
│   │   ├── press/          # 언론보도
│   │   ├── products/       # 제품 페이지
│   │   └── search/         # 검색 페이지
│   ├── components/         # 재사용 가능한 컴포넌트
│   │   ├── admin/          # 관리자 전용 컴포넌트
│   │   ├── Header.tsx      # 헤더 컴포넌트
│   │   └── Footer.tsx      # 푸터 컴포넌트
│   ├── lib/                # 유틸리티 함수
│   └── models/             # MongoDB 스키마
├── public/                 # 정적 파일
│   ├── locales/           # 다국어 파일
│   └── logo/              # 로고 이미지
└── vercel.json            # Vercel 설정
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- MongoDB Atlas 계정
- Vercel 계정 (배포용)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd sonaverse-homepage
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   


4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **브라우저에서 확인**
   - 메인 사이트: [http://localhost:3000](http://localhost:3000)
   - 관리자 페이지: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📝 관리자 기능

### 접근 방법
- URL: `/admin`
- 기본 계정: 관리자 설정에서 생성 필요

### 주요 기능
- **대시보드**: 사이트 통계 및 빠른 액션
- **페이지 관리**: 동적 페이지 콘텐츠 관리
- **제품 관리**: 제품 정보 CRUD
- **블로그 관리**: 블로그 포스트 관리
- **문의 관리**: 고객 문의 처리
- **설정**: 사이트 및 시스템 설정

## 🌐 다국어 지원

- **지원 언어**: 한국어, 영어
- **파일 위치**: `public/locales/`
- **언어 전환**: 헤더의 언어 선택 드롭다운

## 📱 반응형 디자인

- **모바일**: 320px 이상
- **태블릿**: 768px 이상
- **데스크톱**: 1024px 이상

## 🚀 배포

### Vercel 배포

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **프로젝트 연결**
   ```bash
   vercel
   ```

3. **환경 변수 설정**
   - Vercel 대시보드에서 환경 변수 설정
   - `MONGODB_URI` 추가

4. **자동 배포**
   - GitHub 연동 시 자동 배포
   - `main` 브랜치 푸시 시 자동 배포

### 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `MONGODB_URI` | MongoDB 연결 문자열 | ✅ |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 토큰 | ✅ |

## 🔧 개발 가이드

### 코드 스타일
- TypeScript 사용
- ESLint + Prettier 설정
- 컴포넌트별 파일 분리
- 재사용 가능한 컴포넌트 설계

### 폴더 구조 규칙
- 페이지별 폴더 분리
- 컴포넌트는 기능별 그룹화
- API 엔드포인트는 RESTful 설계

### 데이터베이스 스키마
- MongoDB Atlas 사용
- Mongoose ODM
- 다국어 필드는 객체 형태로 저장

## 📞 지원

- **이슈 리포트**: GitHub Issues
- **문의**: 관리자 페이지 문의 폼
- **기술 지원**: 개발팀 연락

## 📄 라이선스

이 프로젝트는 SONAVERSE의 내부 프로젝트입니다.

---

© 2024 SONAVERSE. All rights reserved.
