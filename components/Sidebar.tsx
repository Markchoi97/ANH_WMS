'use client';

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
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: '대시보드', href: '/', icon: HomeIcon },
  { name: 'Ops 보드', href: '/ops-board', icon: ChartBarIcon, badge: 'NEW' },
  { name: 'My Tasks', href: '/my-tasks', icon: ClipboardDocumentCheckIcon, badge: 'NEW' },
  { name: '재고 관리', href: '/inventory', icon: CubeIcon },
  { name: '입고 관리', href: '/inbound', icon: ArrowDownTrayIcon },
  { name: '출고 관리', href: '/outbound', icon: ArrowUpTrayIcon },
  { name: '거래처 관리', href: '/partners', icon: UsersIcon },
  { name: '사용자 관리', href: '/users', icon: UserCircleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">WMS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
          );
        })}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-700" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">관리자</p>
            <p className="text-xs text-gray-400">admin@wms.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

