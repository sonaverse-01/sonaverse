'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // PWA가 이미 설치되었는지 확인
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone === true;
    };

    setIsStandalone(checkStandalone());

    // 로컬 스토리지에서 사용자가 이전에 프롬프트를 거부했는지 확인
    const dismissedUntilStr = localStorage.getItem('pwa-install-dismissed');
    if (dismissedUntilStr) {
      const dismissedUntil = new Date(dismissedUntilStr);
      const now = new Date();
      
      if (now < dismissedUntil) {
        setIsDismissed(true);
      } else {
        // 시간이 만료되었으면 기록 제거
        localStorage.removeItem('pwa-install-dismissed');
      }
    }

    // PWA 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      // 기본 설치 프롬프트 방지
      e.preventDefault();
      
      // 이전에 거부했으면 프롬프트를 표시하지 않음
      if (!dismissedUntilStr || new Date() >= new Date(dismissedUntilStr)) {
        // 이벤트를 저장해서 나중에 사용
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowInstallButton(true);
      }
    };

    // 앱이 설치되었을 때
    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      // 설치 완료 시 거부 기록 제거
      localStorage.removeItem('pwa-install-dismissed');
    };

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 정리
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // 설치 프롬프트 표시
    deferredPrompt.prompt();
    
    // 사용자 선택 기다리기
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // 프롬프트 정리
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    // 로컬 스토리지에 거부 기록 저장 (24시간)
    const dismissedUntil = new Date();
    dismissedUntil.setDate(dismissedUntil.getDate() + 1);
    localStorage.setItem('pwa-install-dismissed', dismissedUntil.toISOString());
    
    setShowInstallButton(false);
    setIsDismissed(true);
  };

  // 이미 설치되었거나 설치 프롬프트가 없거나 거부했으면 표시하지 않음
  if (isStandalone || !showInstallButton || !deferredPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              📱
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              관리자 앱 설치
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              홈 화면에 관리자 앱을 추가하여 더 빠르게 접근하세요.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                설치하기
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;