'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

interface SlugCheckResult {
  blog: { exists: boolean; title: string };
  press: { exists: boolean; title: string };
  brandStory: { exists: boolean; title: string };
  product: { exists: boolean; title: string };
}

interface SlugCheckerProps {
  slug: string;
  originalSlug?: string; // 수정 시 원본 슬러그
  onCheck?: (hasConflict: boolean) => void;
  onValidated?: (isValid: boolean) => void; // 검증 완료 상태
}

const SlugChecker: React.FC<SlugCheckerProps> = ({ slug, originalSlug, onCheck, onValidated }) => {
  const { addToast } = useToast();
  const [checking, setChecking] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [lastCheckedSlug, setLastCheckedSlug] = useState('');

  // 슬러그가 변경되면 검증 상태 초기화
  useEffect(() => {
    if (slug !== lastCheckedSlug) {
      setIsValidated(false);
      onValidated?.(false);
    }
  }, [slug, lastCheckedSlug, onValidated]);

  const handleCheck = async () => {
    if (!slug.trim()) {
      addToast({
        type: 'error',
        message: '슬러그를 입력해주세요.'
      });
      return;
    }

    // 수정 시 원본 슬러그와 같으면 중복 확인 건너뛰기
    if (originalSlug && slug.trim() === originalSlug) {
      setIsValidated(true);
      onValidated?.(true);
      onCheck?.(false);
      setLastCheckedSlug(slug.trim());
      addToast({
        type: 'success',
        message: '사용 가능한 슬러그입니다.'
      });
      return;
    }

    setChecking(true);

    try {
      const response = await fetch('/api/check-slug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: slug.trim() })
      });

      if (!response.ok) {
        throw new Error('슬러그 확인에 실패했습니다.');
      }

      const data = await response.json();
      const hasConflict = data.hasConflict;
      
      onCheck?.(hasConflict);
      setIsValidated(true);
      onValidated?.(true);
      setLastCheckedSlug(slug.trim());

      if (hasConflict) {
        addToast({
          type: 'error',
          message: '중복된 슬러그입니다. 다른 슬러그를 사용해주세요.'
        });
      } else {
        addToast({
          type: 'success',
          message: '사용 가능한 슬러그입니다.'
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : '슬러그 확인 중 오류가 발생했습니다.'
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={checking || !slug.trim()}
          className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isValidated && slug.trim() === lastCheckedSlug
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-amber-700 text-white hover:bg-amber-800'
          }`}
        >
          {checking ? '확인 중...' : isValidated && slug.trim() === lastCheckedSlug ? '사용 가능' : '중복 확인'}
        </button>
      </div>
    </div>
  );
};

export default SlugChecker; 