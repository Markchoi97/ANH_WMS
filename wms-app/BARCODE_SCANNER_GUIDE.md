# 바코드/QR 스캐너 연동 및 인쇄 가이드

> ANH WMS 스캐너 통합 및 라벨 출력 가이드

---

## 📋 목차

1. [스캐너 연동 방법](#스캐너-연동-방법)
2. [바코드 생성 및 인쇄](#바코드-생성-및-인쇄)
3. [권장 하드웨어](#권장-하드웨어)
4. [구현 예제 코드](#구현-예제-코드)
5. [문제 해결](#문제-해결)

---

## 스캐너 연동 방법

### 🔍 1. 웹 카메라 방식 (현재 구현)

#### 장점
- ✅ 추가 하드웨어 불필요
- ✅ 모바일/태블릿에서 바로 사용 가능
- ✅ QR코드와 바코드 모두 스캔 가능

#### 구현 방법

**1) 라이브러리 설치**
```bash
npm install react-qr-reader
npm install html5-qrcode
```

**2) QR/바코드 스캐너 컴포넌트**

```tsx
// components/BarcodeScanner.tsx
'use client';

import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);

  const startScanning = () => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ]
      },
      false
    );

    scanner.render(
      (decodedText) => {
        console.log('스캔 성공:', decodedText);
        onScan(decodedText);
        scanner.clear();
        setScanning(false);
      },
      (error) => {
        console.error('스캔 오류:', error);
        if (onError) onError(error);
      }
    );

    setScanning(true);
  };

  return (
    <div>
      <div id="qr-reader" style={{ width: '100%' }}></div>
      {!scanning && (
        <button onClick={startScanning} className="btn-primary">
          📷 스캔 시작
        </button>
      )}
    </div>
  );
}
```

**3) 사용 예제**

```tsx
// app/my-tasks/page.tsx
import BarcodeScanner from '@/components/BarcodeScanner';

function MyTasksPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleScan = async (code: string) => {
    // 스캔된 코드 처리
    console.log('스캔된 코드:', code);
    
    // 제품 매칭 확인
    if (selectedTask?.barcode === code) {
      alert('✅ 제품이 일치합니다!');
      // 작업 진행...
    } else {
      alert('❌ 제품이 일치하지 않습니다!');
    }
    
    setShowScanner(false);
  };

  return (
    <div>
      {showScanner ? (
        <BarcodeScanner 
          onScan={handleScan}
          onError={(err) => console.error(err)}
        />
      ) : (
        <button onClick={() => setShowScanner(true)}>
          📷 스캔하기
        </button>
      )}
    </div>
  );
}
```

---

### 🔌 2. USB 바코드 스캐너 방식 (권장)

#### 장점
- ✅ 빠른 스캔 속도
- ✅ 안정적인 인식률
- ✅ 멀티 스캔 가능
- ✅ 업무용으로 최적화

#### 동작 원리

```
USB 스캐너 → 키보드 입력으로 인식 → 웹 페이지에서 자동 수신
```

대부분의 USB 바코드 스캐너는 **키보드 에뮬레이션** 방식으로 동작합니다.
- 스캔 시 자동으로 문자열 입력
- Enter 키 자동 입력 (설정 가능)
- 별도 드라이버 불필요

#### 구현 방법

**1) 자동 감지 Input 컴포넌트**

```tsx
// components/BarcodeInput.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface BarcodeInputProps {
  onScan: (code: string) => void;
  placeholder?: string;
}

export default function BarcodeInput({ onScan, placeholder }: BarcodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [buffer, setBuffer] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const currentTime = new Date().getTime();
      
      // Enter 키 감지 (스캐너가 자동으로 보냄)
      if (e.key === 'Enter' && buffer.length > 0) {
        console.log('바코드 스캔:', buffer);
        onScan(buffer);
        setBuffer('');
        return;
      }

      // 일반 문자 입력
      if (e.key.length === 1) {
        // 스캐너는 매우 빠르게 입력 (보통 50ms 이내)
        if (currentTime - lastKeyTime < 50) {
          setBuffer(prev => prev + e.key);
        } else {
          // 사람이 입력한 것으로 판단
          setBuffer(e.key);
        }
        setLastKeyTime(currentTime);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    
    // 포커스 유지 (스캐너 입력 받기 위해)
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [buffer, lastKeyTime, onScan]);

  return (
    <div className="barcode-input-container">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "스캐너로 바코드를 스캔하세요"}
        className="w-full p-3 border-2 border-blue-500 rounded-lg"
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (buffer.length > 0) {
              onScan(buffer);
              setBuffer('');
            }
          }
        }}
      />
      <p className="text-sm text-gray-500 mt-2">
        💡 스캐너를 이용하거나 직접 입력 후 Enter를 누르세요
      </p>
    </div>
  );
}
```

**2) 사용 예제**

```tsx
// app/inventory/scan/page.tsx
'use client';

import { useState } from 'react';
import BarcodeInput from '@/components/BarcodeInput';
import { getProducts } from '@/lib/api/products';

export default function InventoryScanPage() {
  const [scannedProduct, setScannedProduct] = useState(null);
  const [history, setHistory] = useState<string[]>([]);

  const handleScan = async (code: string) => {
    console.log('스캔된 코드:', code);
    
    try {
      // 제품 조회
      const products = await getProducts();
      const product = products.find(p => p.sku === code);
      
      if (product) {
        setScannedProduct(product);
        setHistory(prev => [code, ...prev.slice(0, 9)]); // 최근 10개
        
        // 성공 사운드 (선택사항)
        new Audio('/sounds/beep-success.mp3').play();
        
        alert(`✅ ${product.name} - 재고: ${product.quantity}${product.unit}`);
      } else {
        alert('❌ 제품을 찾을 수 없습니다.');
        new Audio('/sounds/beep-error.mp3').play();
      }
    } catch (error) {
      console.error('제품 조회 실패:', error);
      alert('❌ 조회 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">📦 재고 스캔</h1>
      
      <BarcodeInput 
        onScan={handleScan}
        placeholder="바코드를 스캔하세요..."
      />

      {scannedProduct && (
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-bold">{scannedProduct.name}</h2>
          <p className="text-gray-700">SKU: {scannedProduct.sku}</p>
          <p className="text-gray-700">재고: {scannedProduct.quantity}{scannedProduct.unit}</p>
          <p className="text-gray-700">위치: {scannedProduct.location}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">스캔 이력</h3>
          <ul className="space-y-1">
            {history.map((code, idx) => (
              <li key={idx} className="text-sm text-gray-600">
                {idx + 1}. {code}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

### 📱 3. 모바일 앱 방식 (고급)

React Native로 네이티브 앱을 만들면 더 강력한 기능을 사용할 수 있습니다.

```bash
# React Native 바코드 스캐너
npm install react-native-camera
npm install react-native-qrcode-scanner
```

---

## 바코드 생성 및 인쇄

### 📊 1. 바코드 생성

#### 라이브러리 설치

```bash
npm install jsbarcode
npm install qrcode
npm install @types/qrcode
```

#### 바코드 생성 컴포넌트

```tsx
// components/BarcodeGenerator.tsx
'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface BarcodeGeneratorProps {
  value: string;
  type: 'barcode' | 'qrcode';
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export default function BarcodeGenerator({
  value,
  type,
  width = 2,
  height = 100,
  displayValue = true,
}: BarcodeGeneratorProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (type === 'barcode' && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize: 14,
          margin: 10,
        });
      } catch (error) {
        console.error('바코드 생성 실패:', error);
      }
    }

    if (type === 'qrcode' && qrcodeRef.current) {
      try {
        QRCode.toCanvas(qrcodeRef.current, value, {
          width: 200,
          margin: 2,
        });
      } catch (error) {
        console.error('QR코드 생성 실패:', error);
      }
    }
  }, [value, type, width, height, displayValue]);

  if (type === 'barcode') {
    return <svg ref={barcodeRef}></svg>;
  }

  if (type === 'qrcode') {
    return <canvas ref={qrcodeRef}></canvas>;
  }

  return null;
}
```

#### 사용 예제

```tsx
// app/inventory/labels/page.tsx
'use client';

import { useState, useEffect } from 'react';
import BarcodeGenerator from '@/components/BarcodeGenerator';
import { getProducts } from '@/lib/api/products';

export default function ProductLabelsPage() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="no-print p-8">
        <h1 className="text-2xl font-bold mb-6">🏷️ 라벨 인쇄</h1>
        
        {/* 제품 선택 */}
        <div className="mb-6">
          {products.map((product) => (
            <label key={product.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProducts([...selectedProducts, product.id]);
                  } else {
                    setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                  }
                }}
              />
              {product.name} ({product.sku})
            </label>
          ))}
        </div>

        <button 
          onClick={handlePrint}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          🖨️ 라벨 인쇄
        </button>
      </div>

      {/* 인쇄 영역 */}
      <div className="print-only">
        {products
          .filter(p => selectedProducts.includes(p.id))
          .map((product) => (
            <div key={product.id} className="label-sheet">
              <div className="label-item">
                <h3 className="font-bold">{product.name}</h3>
                <BarcodeGenerator 
                  value={product.sku} 
                  type="barcode"
                  displayValue={true}
                />
                <p className="text-sm">위치: {product.location}</p>
                <p className="text-sm">₩{product.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
```

### 🖨️ 2. 라벨 인쇄 스타일

```css
/* globals.css */

/* 화면에서는 숨김 */
@media screen {
  .print-only {
    display: none;
  }
}

/* 인쇄 시 */
@media print {
  /* 불필요한 요소 숨김 */
  .no-print {
    display: none !important;
  }

  /* 라벨 시트 레이아웃 */
  .label-sheet {
    page-break-after: always;
  }

  .label-item {
    width: 100mm;
    height: 50mm;
    padding: 5mm;
    border: 1px solid #ccc;
    page-break-inside: avoid;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  /* 여백 제거 */
  @page {
    margin: 5mm;
  }

  body {
    margin: 0;
    padding: 0;
  }
}
```

---

### 🖨️ 3. 전문 라벨 프린터 연동

#### 권장 라벨 프린터

**1) Zebra 프린터 (업계 표준)**
- Zebra GK420d
- Zebra ZD410
- ZPL 언어 사용

**2) TSC 프린터 (가성비)**
- TSC TE200
- TSC TTP-244 Plus
- TSPL 언어 사용

**3) Brother 프린터**
- Brother QL-820NWB
- 무선 지원

#### ZPL 명령어 예제 (Zebra)

```tsx
// services/printer/zebra.ts

export function generateZPL(product: any): string {
  return `
^XA
^FO50,50^A0N,50,50^FD${product.name}^FS
^FO50,120^BY2,3,100
^BCN,100,Y,N,N
^FD${product.sku}^FS
^FO50,240^A0N,30,30^FD가격: ${product.price.toLocaleString()}원^FS
^FO50,280^A0N,30,30^FD위치: ${product.location}^FS
^XZ
  `;
}

export async function printToZebra(zpl: string, printerIP: string) {
  try {
    const response = await fetch(`http://${printerIP}:9100`, {
      method: 'POST',
      body: zpl,
    });
    
    if (response.ok) {
      console.log('인쇄 성공');
      return true;
    }
  } catch (error) {
    console.error('인쇄 실패:', error);
    return false;
  }
}
```

#### 사용 예제

```tsx
// app/inventory/print/page.tsx
import { generateZPL, printToZebra } from '@/services/printer/zebra';

function handlePrint(product) {
  const zpl = generateZPL(product);
  const printerIP = '192.168.1.100'; // 프린터 IP 주소
  
  printToZebra(zpl, printerIP)
    .then(() => alert('✅ 인쇄 완료'))
    .catch(() => alert('❌ 인쇄 실패'));
}
```

---

## 권장 하드웨어

### 🔍 바코드 스캐너

#### 1️⃣ 유선 USB 스캐너 (입문용)

**Symbol LS2208** - 약 15만원
- ✅ 안정적인 성능
- ✅ 1D 바코드 전용
- ✅ USB 케이블 연결
- ✅ 설정 불필요

**Honeywell Voyager 1200g** - 약 20만원
- ✅ 1D/2D 바코드 모두 지원
- ✅ QR코드 스캔 가능
- ✅ 내구성 우수

#### 2️⃣ 무선 스캐너 (권장)

**Symbol DS6708** - 약 40만원
- ✅ 2D 바코드 스캔
- ✅ 무선 연결
- ✅ 10m 거리 지원
- ✅ 충전 크래들 포함

**Datalogic QuickScan QBT2131** - 약 35만원
- ✅ Bluetooth 무선
- ✅ 1D/2D 바코드
- ✅ 배터리 14시간
- ✅ 낙하 방지 (1.8m)

#### 3️⃣ 모바일 스캐너 (휴대용)

**Socket Mobile S720** - 약 50만원
- ✅ 스마트폰 연결
- ✅ iOS/Android 지원
- ✅ 초소형 경량
- ✅ 배터리 8시간

---

### 🖨️ 라벨 프린터

#### 1️⃣ 데스크톱 프린터

**Zebra GK420d** - 약 40만원
- ✅ 업계 표준
- ✅ 4인치 폭
- ✅ USB/LAN 연결
- ✅ ZPL 언어

**TSC TE200** - 약 25만원
- ✅ 가성비 우수
- ✅ 203 DPI
- ✅ USB 연결
- ✅ TSPL 언어

#### 2️⃣ 산업용 프린터

**Zebra ZT411** - 약 200만원
- ✅ 고속 인쇄 (14 ips)
- ✅ 300 DPI
- ✅ 대용량 리본
- ✅ 24시간 연속 작동

#### 3️⃣ 모바일 프린터

**Zebra ZQ320** - 약 80만원
- ✅ 휴대용
- ✅ Bluetooth 무선
- ✅ 3인치 폭
- ✅ 배터리 8시간

---

### 📦 추천 스타터 패키지

#### 🌟 기본 패키지 (약 70만원)
```
1. Symbol LS2208 스캐너 (15만원)
2. TSC TE200 프린터 (25만원)
3. 라벨지 5롤 (5만원)
4. 리본 3개 (15만원)
5. 설치 및 설정 (10만원)
```

#### 🌟 프로 패키지 (약 150만원)
```
1. Honeywell Voyager 1200g (20만원)
2. Zebra GK420d (40만원)
3. Symbol DS6708 무선 (40만원)
4. 라벨지 10롤 (10만원)
5. 리본 5개 (25만원)
6. 설치 및 교육 (15만원)
```

---

## 구현 예제 코드

### 📦 완전한 스캔 & 인쇄 시스템

```tsx
// app/warehouse/scan-and-print/page.tsx
'use client';

import { useState } from 'react';
import BarcodeInput from '@/components/BarcodeInput';
import BarcodeGenerator from '@/components/BarcodeGenerator';
import { getProducts, updateProduct } from '@/lib/api/products';

export default function ScanAndPrintPage() {
  const [mode, setMode] = useState<'scan' | 'print'>('scan');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // 스캔 처리
  const handleScan = async (code: string) => {
    try {
      const products = await getProducts();
      const product = products.find(p => p.sku === code);
      
      if (product) {
        setScannedProduct(product);
        new Audio('/sounds/beep-success.mp3').play();
      } else {
        alert('❌ 제품을 찾을 수 없습니다.');
        new Audio('/sounds/beep-error.mp3').play();
      }
    } catch (error) {
      console.error('조회 실패:', error);
    }
  };

  // 재고 업데이트
  const handleUpdateStock = async (change: number) => {
    if (!scannedProduct) return;
    
    try {
      await updateProduct(scannedProduct.id, {
        quantity: scannedProduct.quantity + change,
      });
      
      alert(`✅ 재고가 ${change > 0 ? '증가' : '감소'}했습니다.`);
      setScannedProduct(null);
    } catch (error) {
      alert('❌ 재고 업데이트 실패');
    }
  };

  // 라벨 인쇄
  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="p-8">
      {/* 모드 전환 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMode('scan')}
          className={`px-6 py-3 rounded-lg ${
            mode === 'scan'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          📷 스캔 모드
        </button>
        <button
          onClick={() => setMode('print')}
          className={`px-6 py-3 rounded-lg ${
            mode === 'print'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          🖨️ 인쇄 모드
        </button>
      </div>

      {/* 스캔 모드 */}
      {mode === 'scan' && (
        <div>
          <h1 className="text-2xl font-bold mb-6">📦 제품 스캔</h1>
          
          <BarcodeInput 
            onScan={handleScan}
            placeholder="바코드를 스캔하세요..."
          />

          {scannedProduct && (
            <div className="mt-6 p-6 bg-white border rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">{scannedProduct.name}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">SKU</p>
                  <p className="font-semibold">{scannedProduct.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">현재 재고</p>
                  <p className="font-semibold">{scannedProduct.quantity}{scannedProduct.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">위치</p>
                  <p className="font-semibold">{scannedProduct.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">단가</p>
                  <p className="font-semibold">₩{scannedProduct.price.toLocaleString()}</p>
                </div>
              </div>

              {/* 수량 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">수량</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full p-3 border rounded-lg"
                  min="1"
                />
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleUpdateStock(quantity)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg"
                >
                  ➕ 입고 ({quantity})
                </button>
                <button
                  onClick={() => handleUpdateStock(-quantity)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg"
                >
                  ➖ 출고 ({quantity})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 인쇄 모드 */}
      {mode === 'print' && (
        <div>
          <h1 className="text-2xl font-bold mb-6">🏷️ 라벨 인쇄</h1>
          
          <BarcodeInput 
            onScan={handleScan}
            placeholder="인쇄할 제품을 스캔하세요..."
          />

          {scannedProduct && (
            <div>
              <div className="no-print mt-6 p-6 bg-white border rounded-lg">
                <h2 className="text-xl font-bold mb-4">미리보기</h2>
                
                <div className="border-2 border-dashed p-4 inline-block">
                  <h3 className="font-bold text-lg mb-2">{scannedProduct.name}</h3>
                  <BarcodeGenerator 
                    value={scannedProduct.sku}
                    type="barcode"
                    displayValue={true}
                  />
                  <p className="text-sm mt-2">위치: {scannedProduct.location}</p>
                  <p className="text-sm">₩{scannedProduct.price.toLocaleString()}</p>
                </div>

                <div className="mt-4 flex gap-4">
                  <button
                    onClick={handlePrintLabel}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                  >
                    🖨️ 인쇄하기
                  </button>
                  <button
                    onClick={() => setScannedProduct(null)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg"
                  >
                    취소
                  </button>
                </div>
              </div>

              {/* 인쇄용 */}
              <div className="print-only">
                <div className="label-item">
                  <h3 className="font-bold text-lg">{scannedProduct.name}</h3>
                  <BarcodeGenerator 
                    value={scannedProduct.sku}
                    type="barcode"
                    displayValue={true}
                  />
                  <p className="text-sm">위치: {scannedProduct.location}</p>
                  <p className="text-sm">₩{scannedProduct.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 문제 해결

### ❓ 일반적인 문제

#### 1. 스캐너가 인식되지 않아요
**원인:**
- USB 연결 불량
- 드라이버 미설치
- 설정 오류

**해결:**
```bash
1. USB 케이블 재연결
2. 다른 USB 포트 시도
3. 스캐너 설명서의 "Factory Reset" 바코드 스캔
4. 키보드 모드로 설정 (보통 기본값)
```

#### 2. 바코드 인식률이 낮아요
**원인:**
- 인쇄 품질 불량
- 바코드 크기 부적절
- 조명 부족

**해결:**
```
1. 바코드 크기를 2배 이상으로 증가
2. 고해상도 프린터 사용 (최소 203 DPI)
3. 열전사 리본 사용 (감열지보다 선명)
4. 조명 개선
```

#### 3. 라벨이 제대로 인쇄되지 않아요
**원인:**
- 용지 설정 오류
- 라벨 크기 불일치

**해결:**
```
1. 프린터 드라이버에서 용지 크기 확인
2. CSS @page 설정 확인
3. 프린터 보정 (Calibration) 실행
```

---

## 📚 추가 자료

### 참고 라이브러리

- **html5-qrcode** - https://github.com/mebjas/html5-qrcode
- **jsbarcode** - https://github.com/lindell/JsBarcode
- **qrcode** - https://github.com/soldair/node-qrcode
- **react-to-print** - https://github.com/gregnb/react-to-print

### 하드웨어 구매처

- **바코드코리아** - https://www.barcodekorea.com
- **POS뱅크** - https://www.posbank.co.kr
- **쿠팡비즈** - 대량 구매 시 할인

---

## 💡 실전 팁

### 🎯 성공적인 도입을 위한 체크리스트

- [ ] 스캐너 테스트 (다양한 바코드 형식)
- [ ] 프린터 테스트 (다양한 라벨 크기)
- [ ] 네트워크 프린터 IP 고정
- [ ] 백업 스캐너/프린터 준비
- [ ] 직원 교육 (최소 2시간)
- [ ] 소모품 재고 확보 (라벨지, 리본)
- [ ] 정기 점검 일정 수립

### 📊 ROI (투자 대비 효과)

**Before (수기 작업)**
- 입고 처리: 10분/건
- 재고 확인: 5분/건
- 오입력률: 5%

**After (바코드 시스템)**
- 입고 처리: 1분/건 (90% 단축 ⚡)
- 재고 확인: 10초/건 (97% 단축 ⚡)
- 오입력률: 0.1% (98% 감소 ✅)

---

**🎉 바코드 시스템으로 업무 효율을 10배 높이세요!**

