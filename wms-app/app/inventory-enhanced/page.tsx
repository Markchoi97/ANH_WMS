'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  getCurrentInventory,
  getBundleCompositions,
  getBundleComponentsBySku,
} from '@/lib/api/movements';
import type { CurrentInventory, BundleComposition } from '@/types';
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CubeTransparentIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function InventoryEnhancedPage() {
  const [inventory, setInventory] = useState<CurrentInventory[]>([]);
  const [compositions, setCompositions] = useState<BundleComposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKind, setSelectedKind] = useState<string>('전체');
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [selectedBundleComps, setSelectedBundleComps] = useState<BundleComposition[]>([]);

  useEffect(() => {
    loadData();
    // 5초마다 자동 새로고침 (실시간 재고)
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [invData, compData] = await Promise.all([
        getCurrentInventory(),
        getBundleCompositions(),
      ]);
      setInventory(invData);
      setCompositions(compData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  const kindOptions = [
    '전체',
    'ORIGINAL',
    'BUNDLE',
    'SET',
  ];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKind =
      selectedKind === '전체' || item.productKind === selectedKind;
    return matchesSearch && matchesKind;
  });

  // 번들 구성 조회
  const handleViewComposition = async (sku: string) => {
    if (selectedSku === sku) {
      setSelectedSku(null);
      setSelectedBundleComps([]);
    } else {
      try {
        const comps = await getBundleComponentsBySku(sku);
        setSelectedBundleComps(comps);
        setSelectedSku(sku);
      } catch (error) {
        console.error('번들 구성 조회 실패:', error);
      }
    }
  };

  // 제품 종류 라벨
  const getKindLabel = (kind?: string) => {
    switch (kind) {
      case 'ORIGINAL':
        return '원품';
      case 'BUNDLE':
        return '번들';
      case 'SET':
        return '세트';
      default:
        return '-';
    }
  };

  // 제품 종류 색상
  const getKindColor = (kind?: string) => {
    switch (kind) {
      case 'ORIGINAL':
        return 'bg-gray-100 text-gray-800';
      case 'BUNDLE':
        return 'bg-blue-100 text-blue-800';
      case 'SET':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 번들 가능 수량 계산
  const getMaxBundleQty = (bundleSku: string): number | null => {
    const comps = compositions.filter((c) => c.bundleSku === bundleSku);
    if (comps.length === 0) return null;

    // 각 구성품별로 가능한 번들 수량 계산
    const possibleQtys = comps.map((comp) =>
      Math.floor(comp.componentStock / comp.qtyPerBundle)
    );

    // 가장 작은 값이 실제 만들 수 있는 번들 수량
    return Math.min(...possibleQtys);
  };

  if (loading && inventory.length === 0) {
    return (
      <div>
        <Header title="📦 실시간 재고 현황" />
        <div className="p-8">
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="📦 실시간 재고 현황 (번들 구성 포함)" />

      <div className="p-8">
        {/* 실시간 업데이트 표시 */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>실시간 업데이트 (5초마다 자동 새로고침)</span>
          </div>
          <span>•</span>
          <span>마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}</span>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium mb-2">검색</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="제품명 또는 SKU 검색"
                  className="w-full pl-10 p-3 border rounded-lg"
                />
              </div>
            </div>

            {/* 제품 종류 필터 */}
            <div>
              <label className="block text-sm font-medium mb-2">제품 종류</label>
              <select
                value={selectedKind}
                onChange={(e) => setSelectedKind(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                {kindOptions.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind === '전체' ? '전체' : getKindLabel(kind)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 재고 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">전체 제품</p>
            <p className="text-3xl font-bold text-gray-900">{inventory.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">원품</p>
            <p className="text-3xl font-bold text-gray-600">
              {inventory.filter((i) => i.productKind === 'ORIGINAL').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">번들</p>
            <p className="text-3xl font-bold text-blue-600">
              {inventory.filter((i) => i.productKind === 'BUNDLE').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">재고 부족</p>
            <p className="text-3xl font-bold text-red-600">
              {inventory.filter((i) => i.qty < i.minStock).length}
            </p>
          </div>
        </div>

        {/* 재고 테이블 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-semibold">제품명</th>
                <th className="p-4 text-left font-semibold">SKU</th>
                <th className="p-4 text-left font-semibold">종류</th>
                <th className="p-4 text-left font-semibold">카테고리</th>
                <th className="p-4 text-right font-semibold">현재 재고</th>
                <th className="p-4 text-right font-semibold">최소 재고</th>
                <th className="p-4 text-left font-semibold">위치</th>
                <th className="p-4 text-center font-semibold">번들 구성</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLowStock = item.qty < item.minStock;
                  const maxBundle = getMaxBundleQty(item.sku);
                  const hasComposition =
                    item.productKind === 'BUNDLE' || item.productKind === 'SET';

                  return (
                    <>
                      <tr
                        key={item.sku}
                        className={`border-t hover:bg-gray-50 ${
                          isLowStock ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="p-4">
                          <div className="font-semibold">{item.name}</div>
                          {item.baseName && item.baseName !== item.name && (
                            <div className="text-sm text-gray-500">
                              {item.baseName}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-600">{item.sku}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getKindColor(
                              item.productKind
                            )}`}
                          >
                            {getKindLabel(item.productKind)}
                            {item.packCode && ` (${item.packCode})`}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{item.category}</td>
                        <td className="p-4 text-right">
                          <span
                            className={`font-bold ${
                              isLowStock ? 'text-red-600' : 'text-gray-900'
                            }`}
                          >
                            {item.qty} {item.unit}
                          </span>
                          {isLowStock && (
                            <ExclamationTriangleIcon className="inline ml-2 h-5 w-5 text-red-600" />
                          )}
                        </td>
                        <td className="p-4 text-right text-sm text-gray-600">
                          {item.minStock} {item.unit}
                        </td>
                        <td className="p-4 text-sm">{item.location}</td>
                        <td className="p-4 text-center">
                          {hasComposition ? (
                            <button
                              onClick={() => handleViewComposition(item.sku)}
                              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                                selectedSku === item.sku
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <CubeTransparentIcon className="inline h-4 w-4 mr-1" />
                              {selectedSku === item.sku ? '닫기' : '보기'}
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>

                      {/* 번들 구성 상세 */}
                      {selectedSku === item.sku && selectedBundleComps.length > 0 && (
                        <tr>
                          <td colSpan={8} className="p-0">
                            <div className="bg-blue-50 p-6 border-t border-b">
                              <h4 className="font-bold text-blue-900 mb-4">
                                📦 번들 구성 ({item.name})
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                {/* 구성품 목록 */}
                                <div>
                                  <p className="font-semibold mb-2">구성품:</p>
                                  <ul className="space-y-2">
                                    {selectedBundleComps.map((comp, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-center justify-between bg-white p-3 rounded-lg"
                                      >
                                        <div>
                                          <span className="font-semibold">
                                            {comp.componentName}
                                          </span>
                                          <span className="text-sm text-gray-600 ml-2">
                                            ({comp.componentSku})
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold">
                                            {comp.qtyPerBundle}개 / 번들
                                          </div>
                                          <div
                                            className={`text-sm ${
                                              comp.componentStock > 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}
                                          >
                                            현재: {comp.componentStock}개
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* 번들 가능 수량 */}
                                <div>
                                  <p className="font-semibold mb-2">
                                    생성 가능 번들 수량:
                                  </p>
                                  <div className="bg-white p-6 rounded-lg text-center">
                                    {maxBundle !== null && maxBundle >= 0 ? (
                                      <>
                                        <div className="text-4xl font-bold text-blue-600 mb-2">
                                          {maxBundle}개
                                        </div>
                                        {maxBundle > 0 ? (
                                          <div className="flex items-center justify-center gap-2 text-green-600">
                                            <CheckCircleIcon className="h-5 w-5" />
                                            <span>생성 가능</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-center gap-2 text-red-600">
                                            <XCircleIcon className="h-5 w-5" />
                                            <span>재고 부족</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-gray-500">-</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


