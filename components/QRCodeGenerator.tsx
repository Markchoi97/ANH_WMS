'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

/**
 * QR 코드 생성 컴포넌트
 * - Canvas 형식으로 QR 코드 생성
 * - 인쇄 가능
 */
export default function QRCodeGenerator({
  value,
  size = 200
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('QR 코드 생성 실패:', error);
      }
    }
  }, [value, size]);

  if (!value) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ width: size, height: size }}
      >
        <p className="text-gray-500 text-sm">QR 값 입력 필요</p>
      </div>
    );
  }

  return (
    <div className="inline-block">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

