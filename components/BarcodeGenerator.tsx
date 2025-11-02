'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  format?: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39';
}

/**
 * 바코드 생성 컴포넌트
 * - SVG 형식으로 바코드 생성
 * - 인쇄 가능
 * - 다양한 바코드 형식 지원
 */
export default function BarcodeGenerator({
  value,
  width = 2,
  height = 100,
  displayValue = true,
  format = 'CODE128'
}: BarcodeGeneratorProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format,
          width,
          height,
          displayValue,
          fontSize: 16,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (error) {
        console.error('바코드 생성 실패:', error);
      }
    }
  }, [value, format, width, height, displayValue]);

  if (!value) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
        <p className="text-gray-500">바코드 값을 입력하세요</p>
      </div>
    );
  }

  return (
    <div className="inline-block">
      <svg ref={barcodeRef}></svg>
    </div>
  );
}

