'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CubeIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  UsersIcon, 
  UserCircleIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  QrCodeIcon,
  CubeTransparentIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TruckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SubMenuItem {
  name: string;
  href: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  subItems?: SubMenuItem[];
}

const navigation: NavigationItem[] = [
  { name: '대시보드', href: '/', icon: HomeIcon },
  { 
    name: '🌐 해외배송', 
    href: '/global-fulfillment', 
    icon: GlobeAltIcon, 
    badge: 'NEW',
    subItems: [
      { name: '드롭시핑', href: '/global-fulfillment/drop-shipping' },
      { name: '상품 준비', href: '/global-fulfillment/preparation' },
      { name: '파도 관리', href: '/global-fulfillment/wave-management' },
      { name: '2차 정렬', href: '/global-fulfillment/second-sorting' },
      { name: '검증/검사', href: '/global-fulfillment/inspection' },
      { name: '패키지 검증', href: '/global-fulfillment/package-check' },
      { name: '무게 측정', href: '/global-fulfillment/weight-check' },
      { name: '교환/반품', href: '/global-fulfillment/returns' },
      { name: '이상 처리', href: '/global-fulfillment/exceptions' },
      { name: '마감 시간', href: '/global-fulfillment/cutoff' },
    ]
  },
  { name: 'Ops 보드', href: '/ops-board', icon: ChartBarIcon, badge: 'NEW' },
  { name: 'My Tasks', href: '/my-tasks', icon: ClipboardDocumentCheckIcon, badge: 'NEW' },
  { name: '주문업로드&배송연동', href: '/orders', icon: DocumentTextIcon, badge: 'NEW' },
  { name: '번들/세트 관리', href: '/bundle-management', icon: CubeTransparentIcon, badge: 'NEW' },
  { name: '작업 이력', href: '/movements', icon: ClockIcon, badge: 'NEW' },
  { name: '엑셀 업로드', href: '/excel-upload', icon: DocumentArrowUpIcon, badge: 'NEW' },
  { name: '🔍 스캐너 테스트', href: '/scanner-test', icon: QrCodeIcon, badge: 'TEST' },
  { name: '재고 관리', href: '/inventory', icon: CubeIcon },
  { name: '실시간 재고', href: '/inventory-enhanced', icon: CubeIcon, badge: 'NEW' },
  { name: '입고 관리', href: '/inbound', icon: ArrowDownTrayIcon },
  { name: '출고 관리', href: '/outbound', icon: ArrowUpTrayIcon },
  { name: '거래처 관리', href: '/partners', icon: UsersIcon },
  { name: '사용자 관리', href: '/users', icon: UserCircleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['🌐 해외배송']); // 기본으로 해외배송 열림

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-blue-600">
      <div className="flex h-16 items-center justify-center border-b border-blue-700">
        <h1 className="text-2xl font-bold text-white">ANH WMS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const isExpanded = expandedItems.includes(item.name);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isSubItemActive = hasSubItems && item.subItems.some(sub => pathname === sub.href);

          return (
            <div key={item.name}>
              {/* 메인 메뉴 */}
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={`
                    w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors
                    ${
                      isActive || isSubItemActive
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors
                    ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}

              {/* 하위 메뉴 */}
              {hasSubItems && isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`
                          flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors
                          ${
                            isSubActive
                              ? 'bg-blue-800 text-white'
                              : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                          }
                        `}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-blue-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">관리자</p>
            <p className="text-xs text-blue-200">admin@anhwms.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

