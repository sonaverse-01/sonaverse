# 소나버스 홈페이지

## 문제 해결 가이드

### 1. Resend 이메일 전송 실패 문제

**문제**: `Resend 이메일 전송 실패: Unable to fetch data. The request could not be resolved.`

**해결 방법**:

1. **Resend API 키 설정**
   - `email-config.example.env` 파일을 `.env.local`로 복사
   - 유효한 Resend API 키 설정:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   RESEND_FROM_EMAIL=noreply@sonaverse.kr
   ```

2. **Resend 도메인 등록**
   - [Resend Dashboard](https://resend.com/domains)에서 도메인 등록
   - `sonaverse.kr` 도메인 추가 및 DNS 설정 완료
   - 도메인 검증 완료 후 이메일 전송 가능

3. **환경 변수 확인**
   - 프로덕션 환경에서 환경 변수가 올바르게 설정되었는지 확인
   - Vercel 등의 배포 플랫폼에서 환경 변수 설정

### 2. 방문자 로깅 401 에러 문제

**문제**: `Error in logVisitorToDB: [Error: Failed to log visitor data: 401]`

**해결 방법**:
- 내부 API 호출 시 인증 헤더 추가로 해결됨
- 미들웨어에서 `X-Internal-Call` 헤더를 사용하여 인증 우회
- 개발 환경에서는 로깅이 비활성화됨

### 3. 문의 삭제 기능 문제

**문제**: 관리자 페이지에서 삭제 버튼 클릭 시 실제 데이터가 삭제되지 않음

**해결 방법**:
- 프론트엔드에서 실제 API 호출 추가
- 백엔드에서 관리자 인증 확인
- 삭제 성공 시에만 UI에서 제거

### 4. 추가 개선사항

1. **이메일 전송 개선**
   - 개별 이메일 주소에 대한 전송 시도
   - 구체적인 에러 메시지 제공
   - 이메일 전송 실패 시에도 문의 저장 유지

2. **보안 강화**
   - 문의 삭제 시 관리자 인증 필수
   - 내부 API 호출 시 적절한 헤더 사용

3. **에러 처리 개선**
   - 더 상세한 에러 로깅
   - 사용자 친화적인 에러 메시지

## 환경 설정

### 필수 환경 변수

```env
# Resend 이메일 설정
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@sonaverse.kr

# 문의 알림 수신자 이메일 주소 (쉼표로 구분)
INQUIRY_RECIPIENT_EMAILS=sgd@sonaverse.kr, ceo@sonaverse.kr

# 데이터베이스 설정
MONGODB_URI=your_mongodb_connection_string

# 기타 설정
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_site_url
```

### 개발 환경 실행

```bash
npm install
npm run dev
```

### 프로덕션 배포

```bash
npm run build
npm start
```

## 문제 해결 체크리스트

- [ ] Resend API 키가 올바르게 설정되었는가?
- [ ] Resend에서 도메인이 등록되고 검증되었는가?
- [ ] 환경 변수가 프로덕션 환경에 설정되었는가?
- [ ] 데이터베이스 연결이 정상적인가?
- [ ] 관리자 계정이 올바르게 설정되었는가?
