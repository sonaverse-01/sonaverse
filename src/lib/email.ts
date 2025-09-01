/**
 * 이메일 알림 유틸리티
 * Resend를 사용한 이메일 전송
 */

import { Resend } from 'resend';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * 이메일 전송 함수 (Resend 사용)
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    // Resend API 키 확인
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('Resend API 키가 설정되지 않았습니다.');
      return false;
    }

    // Resend 클라이언트 생성
    const resend = new Resend(resendApiKey);

    // 이메일 전송
    const { data, error } = await resend.emails.send({
      from: 'noreply@sonaverse.kr',
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('Resend 이메일 전송 실패:', error);
      return false;
    }

    console.log('이메일 전송 성공:', data);
    return true;

  } catch (error) {
    console.error('이메일 전송 실패:', error);
    return false;
  }
}

/**
 * 문의 접수 알림 이메일
 */
export async function sendInquiryNotification(inquiryData: any): Promise<boolean> {
  const subject = '새로운 문의가 접수되었습니다';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>새로운 문의 접수</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #bda191; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .field strong { color: #555; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #bda191; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>새로운 문의 접수</h1>
        </div>
        <div class="content">
          <div class="field">
            <strong>문의 유형:</strong> ${inquiryData.inquiry_type_label || inquiryData.inquiry_type}
          </div>
          <div class="field">
            <strong>이름:</strong> ${inquiryData.name}
          </div>
          <div class="field">
            <strong>직급:</strong> ${inquiryData.position || '미입력'}
          </div>
          <div class="field">
            <strong>회사명:</strong> ${inquiryData.company_name || '미입력'}
          </div>
          <div class="field">
            <strong>이메일:</strong> <a href="mailto:${inquiryData.email}">${inquiryData.email}</a>
          </div>
          <div class="field">
            <strong>전화번호:</strong> <a href="tel:${inquiryData.phone_number}">${inquiryData.phone_number}</a>
          </div>
          <div class="field">
            <strong>문의 내용:</strong>
            <div class="message-box">
              ${inquiryData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          ${inquiryData.attached_files && inquiryData.attached_files.length > 0 ? `
          <div class="field">
            <strong>첨부파일:</strong>
            <ul>
              ${inquiryData.attached_files.map((file: string) => `<li><a href="${file}" target="_blank">${file.split('/').pop()}</a></li>`).join('')}
            </ul>
          </div>
          ` : ''}
          <div class="field">
            <strong>접수 시간:</strong> ${new Date(inquiryData.submitted_at).toLocaleString('ko-KR')}
          </div>
          <div class="field">
            <strong>개인정보 동의:</strong> ${inquiryData.privacy_consented ? '동의함' : '동의하지 않음'}
          </div>
        </div>
        <div class="footer">
          <p>이 이메일은 소나버스 홈페이지 문의폼을 통해 자동으로 발송되었습니다.</p>
          <p>© 2024 Sonaverse. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: 'sgd@sonaverse.kr, ceo@sonaverse.kr',
    subject,
    html
  });
}

/**
 * 문의 상태 변경 알림 이메일
 */
export async function sendInquiryStatusUpdate(inquiryData: any, newStatus: string): Promise<boolean> {
  const statusText = {
    'pending': '접수됨',
    'in_progress': '처리중',
    'completed': '완료',
    'closed': '종료'
  };

  const subject = `문의 상태가 변경되었습니다: ${statusText[newStatus as keyof typeof statusText]}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>문의 상태 변경</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #bda191; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .field strong { color: #555; }
        .status { background: #e8f5e8; padding: 10px; border-radius: 5px; color: #2d5a2d; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>문의 상태 변경</h1>
        </div>
        <div class="content">
          <div class="field">
            <strong>문의 유형:</strong> ${inquiryData.inquiry_type_label || inquiryData.inquiry_type}
          </div>
          <div class="field">
            <strong>이름:</strong> ${inquiryData.name}
          </div>
          <div class="field">
            <strong>회사명:</strong> ${inquiryData.company_name || '미입력'}
          </div>
          <div class="field">
            <strong>새로운 상태:</strong>
            <div class="status">${statusText[newStatus as keyof typeof statusText]}</div>
          </div>
          <div class="field">
            <strong>변경 시간:</strong> ${new Date().toLocaleString('ko-KR')}
          </div>
        </div>
        <div class="footer">
          <p>이 이메일은 소나버스 관리자 시스템을 통해 자동으로 발송되었습니다.</p>
          <p>© 2024 Sonaverse. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: inquiryData.email,
    subject,
    html
  });
}

/**
 * 관리자 계정 생성 알림 이메일
 */
export async function sendAdminAccountCreated(userData: any, tempPassword: string): Promise<boolean> {
  const subject = '관리자 계정이 생성되었습니다';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>관리자 계정 생성</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #bda191; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .field strong { color: #555; }
        .warning { background: #fff3cd; padding: 10px; border-radius: 5px; color: #856404; border-left: 4px solid #ffc107; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>관리자 계정 생성</h1>
        </div>
        <div class="content">
          <div class="field">
            <strong>사용자명:</strong> ${userData.username}
          </div>
          <div class="field">
            <strong>이름:</strong> ${userData.name}
          </div>
          <div class="field">
            <strong>임시 비밀번호:</strong> ${tempPassword}
          </div>
          <div class="warning">
            <strong>보안 주의사항:</strong> 보안을 위해 로그인 후 반드시 비밀번호를 변경해주세요.
          </div>
        </div>
        <div class="footer">
          <p>이 이메일은 소나버스 관리자 시스템을 통해 자동으로 발송되었습니다.</p>
          <p>© 2024 Sonaverse. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userData.email,
    subject,
    html
  });
} 