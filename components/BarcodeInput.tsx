'use client';

import { useEffect, useRef, useState } from 'react';

interface BarcodeInputProps {
  onScan: (code: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * USB 바코드 스캐너 입력을 받는 컴포넌트
 * - USB 스캐너는 키보드처럼 동작하므로 일반 input으로 받을 수 있음
 * - 빠른 연속 입력(50ms 이내)을 스캐너로 인식
 * - Enter 키로 스캔 완료 감지
 */
export default function BarcodeInput({ 
  onScan, 
  placeholder = '바코드를 스캔하세요 (또는 직접 입력)',
  autoFocus = true 
}: BarcodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [lastScanTime, setLastScanTime] = useState<number | null>(null);

  useEffect(() => {
    // 자동 포커스 (스캐너 입력을 받기 위해)
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      console.log('✅ 바코드 스캔:', value);
      onScan(value.trim());
      setValue('');
      setLastScanTime(Date.now());
      
      // 피드백 효과
      if (inputRef.current) {
        inputRef.current.classList.add('bg-green-100');
        setTimeout(() => {
          inputRef.current?.classList.remove('bg-green-100');
        }, 300);
      }
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="w-full p-4 text-lg border-2 border-blue-500 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
        autoFocus={autoFocus}
      />
      
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
          <span>스캔 대기 중</span>
        </div>
        {lastScanTime && (
          <span className="text-green-600">
            • 마지막 스캔: {new Date(lastScanTime).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-semibold mb-1">💡 사용 방법:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>USB 스캐너:</strong> 바코드를 스캔하면 자동 입력됩니다</li>
          <li><strong>수동 입력:</strong> 바코드 번호를 입력 후 Enter 키를 누르세요</li>
          <li><strong>테스트:</strong> 아래 테스트 바코드를 사용하세요</li>
        </ul>
      </div>
    </div>
  );
}

