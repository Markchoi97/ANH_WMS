'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationCircleIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface PreparationItem {
  id: string;
  orderNumber: string;
  sku: string;
  productName: string;
  quantity: number;
  condition: 'normal' | 'damaged' | 'missing';
  needsRepackaging: boolean;
  transshipmentLocation?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function PreparationPage() {
  const [items, setItems] = useState<PreparationItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // TODO: API 호출
    const dummyData: PreparationItem[] = [
      {
        id: '1',
        orderNumber: 'GF-2025-0001',
        sku: 'SKU-CN-001',
        productName: '무선 이어폰',
        quantity: 50,
        condition: 'normal',
        needsRepackaging: false,
        transshipmentLocation: '한국 → 일본',
        status: 'pending'
      },
      {
        id: '2',
        orderNumber: 'GF-2025-0002',
        sku: 'SKU-CN-002',
        productName: '스마트워치',
        quantity: 30,
        condition: 'damaged',
        needsRepackaging: true,
        status: 'pending'
      },
      {
        id: '3',
        orderNumber: 'GF-2025-0003',
        sku: 'SKU-KR-101',
        productName: '뷰티 세트',
        quantity: 20,
        condition: 'normal',
        needsRepackaging: true,
        transshipmentLocation: '한국 → 중국',
        status: 'pending'
      }
    ];
    setItems(dummyData);
  }, []);

  const handleApprove = (ids: string[]) => {
    setItems(items.map(item => 
      ids.includes(item.id) ? { ...item, status: 'approved' } : item
    ));
    setSelectedItems([]);
  };

  const handleReject = (ids: string[]) => {
    setItems(items.map(item => 
      ids.includes(item.id) ? { ...item, status: 'rejected' } : item
    ));
    setSelectedItems([]);
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'damaged') return item.condition === 'damaged';
    if (filter === 'repackaging') return item.needsRepackaging;
    return item.status === filter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">상품 준비 및 환적</h1>
        <p className="text-sm text-gray-600 mt-1">
          입고된 상품의 상태를 확인하고 재포장, 환적지 선택 등 출고 전 처리를 합니다
        </p>
      </div>

      {/* 필터 및 액션 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 ({items.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            대기 ({items.filter(i => i.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('damaged')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'damaged' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            파손 ({items.filter(i => i.condition === 'damaged').length})
          </button>
          <button
            onClick={() => setFilter('repackaging')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'repackaging' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            재포장 필요 ({items.filter(i => i.needsRepackaging).length})
          </button>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(selectedItems)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              승인 ({selectedItems.length})
            </button>
            <button
              onClick={() => handleReject(selectedItems)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              반려 ({selectedItems.length})
            </button>
          </div>
        )}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(filteredItems.map(i => i.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">수량</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">재포장</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">환적지</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">처리상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium">{item.orderNumber}</td>
                <td className="px-4 py-3 text-sm font-mono text-blue-600">{item.sku}</td>
                <td className="px-4 py-3 text-sm">{item.productName}</td>
                <td className="px-4 py-3 text-sm text-center font-semibold">{item.quantity}</td>
                <td className="px-4 py-3">
                  <ConditionBadge condition={item.condition} />
                </td>
                <td className="px-4 py-3 text-center">
                  {item.needsRepackaging ? (
                    <CheckCircleIcon className="h-5 w-5 text-orange-600 inline" />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{item.transshipmentLocation || '-'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 가이드 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-3">💡 출고 전 승인 요청</h3>
        <p className="text-sm text-yellow-800">
          이 단계에서 고객에게 출고 전 승인 요청을 보낼 수 있습니다.
          특히 파손된 상품이나 재포장이 필요한 경우 고객 확인 후 진행하는 것을 권장합니다.
        </p>
      </div>
    </div>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  const classes: any = {
    normal: 'bg-green-100 text-green-700',
    damaged: 'bg-red-100 text-red-700',
    missing: 'bg-orange-100 text-orange-700'
  };

  const labels: any = {
    normal: '정상',
    damaged: '파손',
    missing: '분실'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes[condition]}`}>
      {labels[condition]}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const labels: any = {
    pending: '대기',
    approved: '승인',
    rejected: '반려'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes[status]}`}>
      {labels[status]}
    </span>
  );
}

