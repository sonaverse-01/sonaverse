# 소나버스 홈페이지

소나버스의 공식 홈페이지입니다.

## 기능

- 반응형 웹 디자인
- 다국어 지원 (한국어/영어)
- 문의폼 (이메일 알림 포함)
- 관리자 대시보드
- 제품 정보 관리
- 뉴스/보도자료 관리
- 소나버스 스토리 관리

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 환경변수 설정

### 기본 환경변수
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 데이터베이스 연결
MONGODB_URI=your-mongodb-connection-string

# JWT 시크릿
JWT_SECRET=your-jwt-secret-key

# 관리자 계정
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
```

### 이메일 설정 (문의폼 알림용)

문의폼 제출 시 `sgd@sonaverse.kr`로 이메일 알림을 받으려면 Resend 설정이 필요합니다.

#### Resend 설정 방법:

1. **Resend 계정 생성**
   - https://resend.com 에서 무료 계정 생성

2. **API 키 생성**
   - Settings > API Keys에서 새 API 키 생성
   - `re_`로 시작하는 키를 복사

3. **도메인 등록** (선택사항)
   - Settings > Domains에서 도메인 등록
   - 등록하지 않으면 Resend의 기본 도메인 사용

4. **환경변수 설정**
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```

#### Resend 무료 플랜:
- 월 3,000건 이메일 전송
- 1개 도메인 등록 가능
- REST API 제공

## 문의폼 이메일 알림

문의폼이 제출되면 다음 정보가 포함된 이메일이 `sgd@sonaverse.kr`로 전송됩니다:

- 문의 유형
- 이름, 직급, 회사명
- 연락처 (이메일, 전화번호)
- 문의 내용
- 첨부파일 링크 (있는 경우)
- 접수 시간
- 개인정보 동의 여부

## 배포

이 프로젝트는 Vercel에 최적화되어 있습니다.

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT
- **Email**: Resend
- **Deployment**: Vercel

## 라이선스

© 2024 Sonaverse. All rights reserved.
