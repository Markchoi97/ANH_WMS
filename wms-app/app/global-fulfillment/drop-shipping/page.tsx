'use client';

import { useState, useRef } from 'react';
import { 
  ArrowUpTrayIcon, 
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import BarcodeInput from '@/components/BarcodeInput';

interface ImportRow {
  platformOrderId: string;
  customerName: string;
  sku: string;
  productName: string;
  quantity: number;
  destinationCountry: string;
  shippingMethod: string;
  notes?: string;
  status?: 'success' | 'error' | 'pending';
  message?: string;
}

export default function DropShippingPage() {
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Excel/CSV 파일 업로드
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        // 데이터 매핑
        const mappedData: ImportRow[] = jsonData.map((row) => ({
          platformOrderId: row['주문번호'] || row['订单号'] || row['Order ID'] || '',
          customerName: row['고객사'] || row['客户'] || row['Customer'] || '',
          sku: row['SKU'] || row['商品编号'] || '',
          productName: row['상품명'] || row['商品名'] || row['Product'] || '',
          quantity: parseInt(row['수량'] || row['数量'] || row['Quantity'] || '0'),
          destinationCountry: row['목적국가'] || row['目的国'] || row['Country'] || 'KR',
          shippingMethod: row['배송방법'] || row['运输方式'] || row['Shipping'] || 'air',
          notes: row['비고'] || row['备注'] || row['Notes'] || '',
          status: 'pending'
        }));

        setImportData(mappedData);
      } catch (error) {
        console.error('파일 파싱 오류:', error);
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // 데이터 처리 (입고)
  const handleProcessOrders = async () => {
    setProcessing(true);

    // TODO: 실제 API 호출
    // const response = await fetch('/api/global-fulfillment/drop-shipping/import', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ orders: importData })
    // });

    // 임시: 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    const updatedData = importData.map(row => ({
      ...row,
      status: Math.random() > 0.1 ? 'success' : 'error',
      message: Math.random() > 0.1 ? '입고 완료' : 'SKU를 찾을 수 없습니다'
    })) as ImportRow[];

    setImportData(updatedData);
    setProcessing(false);
  };

  // 바코드 스캔 처리
  const handleBarcodeScan = (barcode: string) => {
    if (scannedItems.includes(barcode)) {
      alert('이미 스캔된 항목입니다.');
      return;
    }

    setScannedItems([...scannedItems, barcode]);

    // TODO: 실제 재고 차감 API 호출
    console.log('바코드 스캔:', barcode);
  };

  // 다운로드 템플릿
  const downloadTemplate = () => {
    const template = [
      {
        '주문번호': 'TB-20250101-001',
        '고객사': '淘宝精品店',
        'SKU': 'SKU-CN-001',
        '상품명': '무선 이어폰',
        '수량': 50,
        '목적국가': 'KR',
        '배송방법': 'air',
        '비고': '급송'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'global_fulfillment_template.xlsx');
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">드롭시핑 (Drop Shipping)</h1>
          <p className="text-sm text-gray-600 mt-1">
            해외 플랫폼 주문 데이터를 업로드하고 국내 창고 입고를 관리합니다
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            📥 템플릿 다운로드
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            Excel/CSV 업로드
          </button>
          <button
            onClick={() => setScanMode(!scanMode)}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              scanMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
            }`}
          >
            <QrCodeIcon className="h-5 w-5" />
            {scanMode ? '스캔 모드 ON' : '바코드 스캔'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* 바코드 스캔 모드 */}
      {scanMode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <QrCodeIcon className="h-6 w-6 text-green-600" />
            바코드/QR 스캔 모드
          </h3>
          <BarcodeInput onScan={handleBarcodeScan} />
          
          {scannedItems.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                스캔된 항목: {scannedItems.length}개
              </p>
              <div className="flex flex-wrap gap-2">
                {scannedItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white border border-green-300 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 업로드된 데이터 테이블 */}
      {importData.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">업로드된 주문 데이터</h2>
              <p className="text-sm text-gray-600">
                총 {importData.length}건 
                {importData.filter(d => d.status === 'success').length > 0 && 
                  ` | 성공: ${importData.filter(d => d.status === 'success').length}건`
                }
                {importData.filter(d => d.status === 'error').length > 0 && 
                  ` | 실패: ${importData.filter(d => d.status === 'error').length}건`
                }
              </p>
            </div>
            <button
              onClick={handleProcessOrders}
              disabled={processing || importData.every(d => d.status !== 'pending')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {processing ? '처리 중...' : '일괄 입고 처리'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객사</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">수량</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">목적국가</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">배송방법</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {importData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {row.status === 'success' && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" title={row.message} />
                      )}
                      {row.status === 'error' && (
                        <XCircleIcon className="h-5 w-5 text-red-600" title={row.message} />
                      )}
                      {row.status === 'pending' && (
                        <div className="h-4 w-4 bg-gray-300 rounded-full animate-pulse" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{row.platformOrderId}</td>
                    <td className="px-4 py-3 text-sm">{row.customerName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{row.sku}</td>
                    <td className="px-4 py-3 text-sm">{row.productName}</td>
                    <td className="px-4 py-3 text-sm text-center font-semibold">{row.quantity}</td>
                    <td className="px-4 py-3 text-sm">{row.destinationCountry}</td>
                    <td className="px-4 py-3 text-sm">
                      <ShippingMethodBadge method={row.shippingMethod} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {importData.length === 0 && !scanMode && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DocumentIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">주문 데이터를 업로드하세요</h3>
          <p className="text-sm text-gray-600 mb-6">
            Excel 또는 CSV 파일로 주문 데이터를 일괄 업로드하거나<br />
            바코드 스캔을 통해 개별 입고 처리가 가능합니다
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={downloadTemplate}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              템플릿 다운로드
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              파일 업로드
            </button>
          </div>
        </div>
      )}

      {/* 사용 가이드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 사용 가이드</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>템플릿 다운로드</strong>: 표준 양식을 다운로드하여 데이터를 입력하세요</li>
          <li>• <strong>플랫폼별 매핑</strong>: Taobao, Shopify, Shopee 등의 주문번호가 자동으로 매핑됩니다</li>
          <li>• <strong>SKU 자동 차감</strong>: 입고 처리 시 재고가 자동으로 차감됩니다</li>
          <li>• <strong>송장 번호</strong>: 시스템이 자동으로 송장번호를 부여합니다</li>
          <li>• <strong>바코드 스캔</strong>: 바코드/QR 스캔을 통해 빠른 입고 처리가 가능합니다</li>
        </ul>
      </div>
    </div>
  );
}

function ShippingMethodBadge({ method }: { method: string }) {
  const classes: any = {
    air: 'bg-blue-100 text-blue-700',
    sea: 'bg-cyan-100 text-cyan-700',
    express: 'bg-red-100 text-red-700'
  };

  const labels: any = {
    air: '항공',
    sea: '해운',
    express: '특송'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes[method] || 'bg-gray-100 text-gray-700'}`}>
      {labels[method] || method}
    </span>
  );
}

