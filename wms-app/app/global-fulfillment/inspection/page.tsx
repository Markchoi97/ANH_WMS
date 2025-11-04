'use client';

import { useState, useRef } from 'react';
import { 
  CameraIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface InspectionItem {
  id: string;
  orderNumber: string;
  sku: string;
  productName: string;
  quantity: number;
  inspected: number;
  condition: 'pending' | 'pass' | 'fail' | 'partial';
  photos: string[];
  notes: string;
}

export default function InspectionPage() {
  const [items, setItems] = useState<InspectionItem[]>([
    {
      id: '1',
      orderNumber: 'GF-2025-0001',
      sku: 'SKU-CN-001',
      productName: '무선 이어폰',
      quantity: 50,
      inspected: 0,
      condition: 'pending',
      photos: [],
      notes: ''
    },
    {
      id: '2',
      orderNumber: 'GF-2025-0002',
      sku: 'SKU-CN-002',
      productName: '스마트워치',
      quantity: 30,
      inspected: 0,
      condition: 'pending',
      photos: [],
      notes: ''
    }
  ]);

  const [selectedItem, setSelectedItem] = useState<InspectionItem | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // 이미지 미리보기 생성
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedPhotos(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleInspectionComplete = (itemId: string, condition: 'pass' | 'fail' | 'partial', notes: string) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, condition, inspected: item.quantity, photos: uploadedPhotos, notes }
        : item
    ));
    setSelectedItem(null);
    setUploadedPhotos([]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">검증 / 검사 (Inspection)</h1>
        <p className="text-sm text-gray-600 mt-1">
          출고 전 제품 이상 여부를 확인하고 검수 사진을 업로드합니다
        </p>
      </div>

      {/* 검사 항목 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 대기 목록 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">검사 대기</h2>
          <div className="space-y-3">
            {items.filter(i => i.condition === 'pending').map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{item.productName}</div>
                    <div className="text-sm text-gray-600">{item.orderNumber} | {item.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{item.quantity}</div>
                    <div className="text-xs text-gray-500">개</div>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
                  검사 시작
                </button>
              </div>
            ))}
            
            {items.filter(i => i.condition === 'pending').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                검사 대기 중인 항목이 없습니다
              </div>
            )}
          </div>
        </div>

        {/* 검사 폼 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">검사 수행</h2>
          
          {selectedItem ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-semibold text-blue-900">{selectedItem.productName}</div>
                <div className="text-sm text-blue-700 mt-1">
                  {selectedItem.orderNumber} | {selectedItem.sku}
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  수량: <span className="font-bold">{selectedItem.quantity}개</span>
                </div>
              </div>

              {/* 사진 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검수 사진 업로드
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition"
                >
                  <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">클릭하여 사진 업로드</p>
                  <p className="text-xs text-gray-500 mt-1">여러 장 선택 가능</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* 업로드된 사진 미리보기 */}
              {uploadedPhotos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    업로드된 사진 ({uploadedPhotos.length})
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedPhotos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <img
                          src={photo}
                          alt={`검수 사진 ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 검사 결과 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검사 결과
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleInspectionComplete(selectedItem.id, 'pass', '정상')}
                    className="px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition font-medium"
                  >
                    ✓ 정상
                  </button>
                  <button
                    onClick={() => handleInspectionComplete(selectedItem.id, 'partial', '일부 파손')}
                    className="px-4 py-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition font-medium"
                  >
                    ⚠ 일부
                  </button>
                  <button
                    onClick={() => handleInspectionComplete(selectedItem.id, 'fail', '불량')}
                    className="px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    ✗ 불량
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedItem(null);
                  setUploadedPhotos([]);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              검사할 항목을 선택하세요
            </div>
          )}
        </div>
      </div>

      {/* 완료된 검사 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">검사 완료</h2>
        <div className="space-y-3">
          {items.filter(i => i.condition !== 'pending').map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-semibold text-gray-900">{item.productName}</div>
                    <InspectionResultBadge condition={item.condition} />
                  </div>
                  <div className="text-sm text-gray-600">{item.orderNumber} | {item.sku}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    수량: {item.inspected} / {item.quantity} | 메모: {item.notes}
                  </div>
                </div>
                {item.photos.length > 0 && (
                  <div className="flex gap-1">
                    {item.photos.slice(0, 3).map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`검수 사진`}
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                    ))}
                    {item.photos.length > 3 && (
                      <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-600 text-sm">
                        +{item.photos.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 가이드 */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
        <h3 className="font-semibold text-cyan-900 mb-3">💡 검수 가이드</h3>
        <ul className="space-y-2 text-sm text-cyan-800">
          <li>• 모든 상품의 외관 상태를 확인하고 사진으로 기록합니다</li>
          <li>• 파손이나 불량이 발견되면 즉시 고객에게 알립니다</li>
          <li>• 검수 사진은 고객이 직접 확인할 수 있어 신뢰도가 높아집니다</li>
          <li>• 불량품은 자동으로 격리재고로 이동됩니다</li>
        </ul>
      </div>
    </div>
  );
}

function InspectionResultBadge({ condition }: { condition: string }) {
  const classes: any = {
    pass: 'bg-green-100 text-green-700',
    fail: 'bg-red-100 text-red-700',
    partial: 'bg-yellow-100 text-yellow-700'
  };

  const labels: any = {
    pass: '정상',
    fail: '불량',
    partial: '일부 문제'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes[condition]}`}>
      {labels[condition]}
    </span>
  );
}

