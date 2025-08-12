# 보안 가이드

## 인증 시스템 보안 특징

### 1. JWT 토큰 보안
- **HttpOnly 쿠키**: JavaScript 접근 불가
- **Secure 플래그**: HTTPS에서만 전송 (프로덕션)
- **SameSite=Strict**: CSRF 공격 방지
- **24시간 만료**: 자동 토큰 만료
- **Issuer/Audience 검증**: 토큰 발급자 및 대상 검증

### 2. 비밀번호 보안
- **bcrypt 해싱**: Salt rounds 12 (보안 강화)
- **최소 8자**: 비밀번호 길이 제한
- **입력 검증**: 이메일 형식 및 필수 필드 검증

### 3. 세션 관리
- **브라우저 탭 닫힘**: 자동 로그아웃
- **세션 스토리지**: 클라이언트 상태 관리
- **중복 로그인 방지**: 이미 인증된 사용자 리다이렉트

### 4. API 보안
- **미들웨어 보호**: 모든 관리자 페이지 보호
- **에러 처리**: 민감한 정보 노출 방지
- **입력 검증**: 모든 사용자 입력 검증
- **타입 안전성**: TypeScript로 타입 검증

### 5. 헤더 보안
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: HTTPS 강제
- **Referrer-Policy**: strict-origin-when-cross-origin

## 환경 변수 설정

### 필수 환경 변수
```bash
# JWT Secret (최소 32자 이상)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# MongoDB 연결
MONGODB_URI=mongodb://localhost:27017/sonaverse

# Node 환경
NODE_ENV=production
```

### 보안 권장사항
1. **강력한 JWT_SECRET 사용**: 최소 32자 이상의 랜덤 문자열
2. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS 사용
3. **정기적인 토큰 갱신**: 24시간 만료 설정
4. **로그 모니터링**: 인증 실패 로그 모니터링
5. **접근 제어**: 관리자 권한별 접근 제어

## 배포 시 주의사항

1. **환경 변수 설정**: 프로덕션 환경에서 모든 환경 변수 설정
2. **HTTPS 강제**: SSL 인증서 설정 및 HTTPS 리다이렉트
3. **도메인 설정**: COOKIE_OPTIONS의 domain 설정
4. **로그 관리**: 에러 로그 및 접근 로그 모니터링
5. **백업**: 정기적인 데이터베이스 백업

## 보안 테스트

### 권장 테스트 항목
- [ ] JWT 토큰 만료 테스트
- [ ] 쿠키 보안 설정 테스트
- [ ] XSS 공격 방지 테스트
- [ ] CSRF 공격 방지 테스트
- [ ] SQL Injection 방지 테스트
- [ ] 인증 우회 테스트
- [ ] 세션 관리 테스트 