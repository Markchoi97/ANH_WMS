'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { getProducts } from '@/lib/api/products';
import { getRecentInbounds, Inbound } from '@/lib/api/inbounds';
import { getRecentOutbounds, Outbound } from '@/lib/api/outbounds';
import { getCurrentInventory, getMovementHistory } from '@/lib/api/movements';
import type { Product, CurrentInventory, MovementHistory } from '@/types';
import { 
  CubeIcon, 
  ExclamationTriangleIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  CubeTransparentIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inbounds, setInbounds] = useState<Inbound[]>([]);
  const [outbounds, setOutbounds] = useState<Outbound[]>([]);
  const [inventory, setInventory] = useState<CurrentInventory[]>([]);
  const [movements, setMovements] = useState<MovementHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [productsData, inboundsData, outboundsData, inventoryData, movementsData] = await Promise.all([
        getProducts(),
        getRecentInbounds(5),
        getRecentOutbounds(5),
        getCurrentInventory(),
        getMovementHistory(50),
      ]);
      setProducts(productsData);
      setInbounds(inboundsData);
      setOutbounds(outboundsData);
      setInventory(inventoryData);
      setMovements(movementsData);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  const lowStockProducts = products.filter(p => p.quantity < p.minStock);
  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  
  // 금일 입출고 건수 (오늘 날짜 기준)
  const today = new Date().toDateString();
  const todayInbounds = inbounds.filter(i => new Date(i.inbound_date).toDateString() === today).length;
  const todayOutbounds = outbounds.filter(o => new Date(o.outbound_date).toDateString() === today).length;

  // 번들 통계
  const bundleStats = {
    original: inventory.filter(i => i.productKind === 'ORIGINAL').length,
    bundle: inventory.filter(i => i.productKind === 'BUNDLE').length,
    set: inventory.filter(i => i.productKind === 'SET').length,
  };

  // 채널별 통계 (최근 50개 작업 기준)
  const channelStats = movements.reduce((acc, m) => {
    if (m.channel) {
      acc[m.channel] = (acc[m.channel] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topChannels = Object.entries(channelStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="대시보드" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="대시보드" />
      
      <main className="flex-1 p-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 제품 수</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <CubeIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 재고 수량</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalStock}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CubeIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">재고 부족 품목</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{lowStockProducts.length}</p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">금일 입/출고</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {todayInbounds}/{todayOutbounds}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 번들/세트 통계 & 채널별 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 번들/세트 통계 */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <CubeTransparentIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">번들/세트 현황</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    <span className="font-medium">원품 (ORIGINAL)</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{bundleStats.original}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="font-medium">번들 (BUNDLE)</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{bundleStats.bundle}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                    <span className="font-medium">세트 (SET)</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{bundleStats.set}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 채널별 통계 */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">채널별 작업 현황 (최근 50개)</h3>
              </div>
            </div>
            <div className="p-6">
              {topChannels.length === 0 ? (
                <p className="text-gray-500 text-center py-8">채널 데이터가 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {topChannels.map(([channel, count], index) => {
                    const maxCount = topChannels[0][1];
                    const percentage = (count / maxCount) * 100;
                    const colors = ['blue', 'green', 'purple', 'orange', 'pink'];
                    const color = colors[index % colors.length];

                    return (
                      <div key={channel}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-700">{channel}</span>
                          <span className="font-bold text-gray-900">{count}건</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-${color}-600 h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 최근 입고 내역 */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ArrowDownTrayIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">최근 입고 내역</h3>
              </div>
            </div>
            <div className="p-6">
              {inbounds.length === 0 ? (
                <p className="text-gray-500 text-center py-8">입고 데이터가 없습니다</p>
              ) : (
                <div className="space-y-4">
                  {inbounds.map((inbound) => (
                    <div key={inbound.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <p className="font-medium text-gray-900">{inbound.product_name}</p>
                        <p className="text-sm text-gray-500">{inbound.supplier_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+{inbound.quantity}{inbound.unit}</p>
                        <p className="text-xs text-gray-500">{formatDate(new Date(inbound.inbound_date))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 최근 출고 내역 */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ArrowUpTrayIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">최근 출고 내역</h3>
              </div>
            </div>
            <div className="p-6">
              {outbounds.length === 0 ? (
                <p className="text-gray-500 text-center py-8">출고 데이터가 없습니다</p>
              ) : (
                <div className="space-y-4">
                  {outbounds.map((outbound) => (
                    <div key={outbound.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <p className="font-medium text-gray-900">{outbound.product_name}</p>
                        <p className="text-sm text-gray-500">{outbound.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">-{outbound.quantity}{outbound.unit}</p>
                        <p className="text-xs text-gray-500">{formatDate(new Date(outbound.outbound_date))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 재고 부족 경고 */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">재고 부족 품목</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제품명
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      현재 재고
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      최소 재고
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      위치
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sku}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className="text-red-600 font-semibold">{product.quantity}{product.unit}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.minStock}{product.unit}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.location}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        재고 부족 품목이 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
