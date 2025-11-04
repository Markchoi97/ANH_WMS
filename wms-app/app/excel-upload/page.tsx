'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import * as XLSX from 'xlsx';
import { createMovement } from '@/lib/api/movements';
import type { CreateMovementRequest, MovementType } from '@/types';

interface ExcelRow {
  제품명: string;
  SKU: string;
  파손?: number;
  '반품(B2C)'?: number;
  '반품(밀크런)'?: number;
  '쿠팡(밀크런)'?: number;
  '재고조정(+)'?: number;
  '재고조정(–)'?: number;
  '번들(+)'?: number;
  '번들(–)'?: number;
  '라벨작업'?: number;
  택배?: number;
  채널?: string;
  메모?: string;
}

interface ParsedMovement {
  sku: string;
  productName: string;
  movementType: MovementType;
  reasonCode: string;
  qtyChange: number;
  channel?: string;
  memo?: string;
}

export default function ExcelUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedMovement[]>([]);
  const [processing, setProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]);

  // 엑셀 파일 읽기
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setUploadSuccess(false);
    setErrorLog([]);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

      // 엑셀 데이터 파싱
      const movements = parseExcelData(jsonData);
      setParsedData(movements);
    } catch (error) {
      console.error('엑셀 파일 읽기 실패:', error);
      alert('엑셀 파일을 읽는데 실패했습니다. 파일 형식을 확인해주세요.');
    }
  };

  // 엑셀 데이터를 작업(Movement)으로 변환
  const parseExcelData = (rows: ExcelRow[]): ParsedMovement[] => {
    const movements: ParsedMovement[] = [];

    rows.forEach((row, index) => {
      const sku = row.SKU?.trim();
      const productName = row.제품명?.trim();

      if (!sku || !productName) {
        console.warn(`행 ${index + 2}: SKU 또는 제품명이 없습니다.`);
        return;
      }

      // 각 컬럼별로 작업 생성
      const columnMappings: Array<{
        column: keyof ExcelRow;
        movementType: MovementType;
        reasonCode: string;
        multiplier: number;
      }> = [
        { column: '파손', movementType: 'ADJUST', reasonCode: 'DAMAGE', multiplier: -1 },
        { column: '반품(B2C)', movementType: 'INBOUND', reasonCode: 'RETURN_B2C', multiplier: 1 },
        { column: '반품(밀크런)', movementType: 'INBOUND', reasonCode: 'RETURN_MILKRUN', multiplier: 1 },
        { column: '쿠팡(밀크런)', movementType: 'INBOUND', reasonCode: 'CP_MILKRUN', multiplier: 1 },
        { column: '재고조정(+)', movementType: 'ADJUST', reasonCode: 'ADJ_PLUS', multiplier: 1 },
        { column: '재고조정(–)', movementType: 'ADJUST', reasonCode: 'ADJ_MINUS', multiplier: -1 },
        { column: '번들(+)', movementType: 'BUNDLE', reasonCode: 'BUNDLE_CREATE', multiplier: 1 },
        { column: '번들(–)', movementType: 'UNBUNDLE', reasonCode: 'BUNDLE_BREAK', multiplier: -1 },
        { column: '라벨작업', movementType: 'LABEL', reasonCode: 'LABEL', multiplier: 0 },
        { column: '택배', movementType: 'OUTBOUND', reasonCode: 'SHIP', multiplier: -1 },
      ];

      columnMappings.forEach(({ column, movementType, reasonCode, multiplier }) => {
        const value = row[column];
        if (value && typeof value === 'number' && value !== 0) {
          movements.push({
            sku,
            productName,
            movementType,
            reasonCode,
            qtyChange: multiplier === 0 ? 0 : value * multiplier,
            channel: row.채널,
            memo: row.메모 ? `${column}: ${row.메모}` : `엑셀 업로드 - ${column}`,
          });
        }
      });
    });

    return movements;
  };

  // 작업 일괄 등록
  const handleBatchUpload = async () => {
    if (parsedData.length === 0) {
      alert('업로드할 데이터가 없습니다.');
      return;
    }

    setProcessing(true);
    setErrorLog([]);
    const errors: string[] = [];

    try {
      // SKU별로 그룹화 (같은 SKU의 작업은 하나의 Movement로 묶음)
      const groupedBySku = parsedData.reduce((acc, movement) => {
        const key = `${movement.sku}-${movement.movementType}-${movement.reasonCode}`;
        if (!acc[key]) {
          acc[key] = {
            ...movement,
            lines: [],
          };
        }
        acc[key].lines.push({
          sku: movement.sku,
          qtyChange: movement.qtyChange,
        });
        return acc;
      }, {} as Record<string, any>);

      // 각 그룹별로 Movement 생성
      let successCount = 0;
      for (const [key, group] of Object.entries(groupedBySku)) {
        try {
          const request: CreateMovementRequest = {
            movementType: group.movementType,
            reasonCode: group.reasonCode,
            channel: group.channel,
            memo: group.memo,
            lines: group.lines,
          };

          await createMovement(request);
          successCount++;
        } catch (error: any) {
          const errorMsg = `${group.productName} (${group.sku}) - ${error.message}`;
          errors.push(errorMsg);
          console.error('작업 생성 실패:', errorMsg);
        }
      }

      if (errors.length === 0) {
        alert(`✅ 모든 작업이 등록되었습니다! (${successCount}개)`);
        setUploadSuccess(true);
        setParsedData([]);
        setFile(null);
      } else {
        alert(`⚠️ 일부 작업 등록 실패\n성공: ${successCount}개\n실패: ${errors.length}개`);
        setErrorLog(errors);
      }
    } catch (error: any) {
      console.error('일괄 업로드 실패:', error);
      alert(`❌ 업로드 실패: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // 샘플 엑셀 다운로드
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        제품명: '리빙말랑귀지킬러',
        SKU: 'LIV-MGGK',
        파손: 5,
        '반품(B2C)': 0,
        '반품(밀크런)': 10,
        '쿠팡(밀크런)': 0,
        '재고조정(+)': 0,
        '재고조정(–)': 0,
        '번들(+)': 0,
        '번들(–)': 0,
        라벨작업: 0,
        택배: 20,
        채널: 'BK',
        메모: '포장 손상',
      },
      {
        제품명: '리빙말랑귀지킬러 (2B)',
        SKU: 'LIV-MGGK-2B',
        파손: 0,
        '반품(B2C)': 2,
        '반품(밀크런)': 0,
        '쿠팡(밀크런)': 0,
        '재고조정(+)': 0,
        '재고조정(–)': 0,
        '번들(+)': 10,
        '번들(–)': 0,
        라벨작업: 0,
        택배: 15,
        채널: '쿠팡',
        메모: '2B 번들 생성',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '작업 데이터');

    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 20 }, // 제품명
      { wch: 15 }, // SKU
      { wch: 8 },  // 파손
      { wch: 12 }, // 반품(B2C)
      { wch: 14 }, // 반품(밀크런)
      { wch: 14 }, // 쿠팡(밀크런)
      { wch: 12 }, // 재고조정(+)
      { wch: 12 }, // 재고조정(–)
      { wch: 10 }, // 번들(+)
      { wch: 10 }, // 번들(–)
      { wch: 10 }, // 라벨작업
      { wch: 8 },  // 택배
      { wch: 12 }, // 채널
      { wch: 20 }, // 메모
    ];

    XLSX.writeFile(workbook, 'ANH_WMS_작업업로드_샘플.xlsx');
  };

  return (
    <div>
      <Header title="📊 엑셀 업로드 마법사" />

      <div className="p-8">
        {/* 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 엑셀 업로드 사용법</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>아래 "📥 샘플 엑셀 다운로드" 버튼을 눌러 양식을 다운받으세요</li>
            <li>엑셀에 작업 데이터를 입력하세요 (제품명, SKU, 각 컬럼별 수량)</li>
            <li>작성한 엑셀 파일을 업로드하세요</li>
            <li>미리보기를 확인한 후 "✅ 일괄 등록" 버튼을 누르세요</li>
          </ol>
        </div>

        {/* 샘플 다운로드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📥 샘플 엑셀 다운로드</h2>
          <p className="text-gray-600 mb-4">
            엑셀 양식을 다운로드하여 작업 데이터를 입력하세요.
          </p>
          <button
            onClick={downloadSampleExcel}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            📥 샘플 엑셀 다운로드
          </button>
        </div>

        {/* 파일 업로드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📤 엑셀 파일 업로드</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              📁 파일 선택
            </label>
            {file && (
              <p className="mt-4 text-gray-700">
                선택된 파일: <strong>{file.name}</strong>
              </p>
            )}
          </div>
        </div>

        {/* 파싱 결과 미리보기 */}
        {parsedData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                📋 업로드 미리보기 ({parsedData.length}개 작업)
              </h2>
              <button
                onClick={handleBatchUpload}
                disabled={processing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {processing ? '처리 중...' : '✅ 일괄 등록'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">제품명</th>
                    <th className="p-3 text-left">SKU</th>
                    <th className="p-3 text-left">작업 유형</th>
                    <th className="p-3 text-left">사유</th>
                    <th className="p-3 text-right">수량 변화</th>
                    <th className="p-3 text-left">채널</th>
                    <th className="p-3 text-left">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((item, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="p-3">{item.productName}</td>
                      <td className="p-3 text-sm text-gray-600">{item.sku}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {item.movementType}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{item.reasonCode}</td>
                      <td className="p-3 text-right">
                        <span className={`font-bold ${item.qtyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.qtyChange > 0 ? '+' : ''}{item.qtyChange}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{item.channel || '-'}</td>
                      <td className="p-3 text-sm text-gray-600">{item.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 오류 로그 */}
        {errorLog.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-bold text-red-900 mb-4">⚠️ 오류 발생 ({errorLog.length}개)</h3>
            <ul className="space-y-2">
              {errorLog.map((error, index) => (
                <li key={index} className="text-red-800 text-sm">
                  {index + 1}. {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 성공 메시지 */}
        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-green-900 mb-2">✅ 업로드 완료!</h3>
            <p className="text-green-800">
              모든 작업이 성공적으로 등록되었습니다. "작업 이력" 메뉴에서 확인하세요.
            </p>
          </div>
        )}

        {/* 컬럼 설명 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
          <h3 className="font-bold text-gray-900 mb-4">📖 엑셀 컬럼 설명</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold">필수 컬럼:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                <li><strong>제품명</strong>: 제품 이름</li>
                <li><strong>SKU</strong>: 제품 코드</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">작업 컬럼 (숫자 입력):</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                <li><strong>파손</strong>: 파손된 수량 (재고 감소)</li>
                <li><strong>반품(B2C)</strong>: B2C 반품 입고 수량</li>
                <li><strong>반품(밀크런)</strong>: 밀크런 반품 입고 수량</li>
                <li><strong>쿠팡(밀크런)</strong>: 쿠팡 밀크런 입고 수량</li>
                <li><strong>재고조정(+)</strong>: 재고 증가 수량</li>
                <li><strong>재고조정(–)</strong>: 재고 감소 수량</li>
                <li><strong>번들(+)</strong>: 번들 생성 수량</li>
                <li><strong>번들(–)</strong>: 번들 해체 수량</li>
                <li><strong>라벨작업</strong>: 라벨 작업 수량</li>
                <li><strong>택배</strong>: 출고 수량 (재고 감소)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">선택 컬럼:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                <li><strong>채널</strong>: 거래처/채널명 (예: BK, YBK, 쿠팡)</li>
                <li><strong>메모</strong>: 추가 메모</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


