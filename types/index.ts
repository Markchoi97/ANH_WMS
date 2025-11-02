// 제품 타입
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  location: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 입고 타입
export interface Inbound {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  inboundDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
  note?: string;
  createdAt: Date;
}

// 출고 타입
export interface Outbound {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  outboundDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
  note?: string;
  createdAt: Date;
}

// 거래처 타입
export interface Partner {
  id: string;
  name: string;
  type: 'supplier' | 'customer' | 'both';
  contact: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 사용자 타입
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt: Date;
}

// 대시보드 통계 타입
export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  totalInboundToday: number;
  totalOutboundToday: number;
  recentInbounds: Inbound[];
  recentOutbounds: Outbound[];
  lowStockProducts: Product[];
}

// 작업 상태 타입
export type WorkStatus = 'planned' | 'in-progress' | 'completed' | 'overdue' | 'on-hold';

// 작업 타입 (입고/출고/포장)
export type WorkType = 'inbound' | 'outbound' | 'packing';

// 작업 지시
export interface WorkOrder {
  id: string;
  type: WorkType;
  title: string;
  description?: string;
  productName: string;
  quantity: number;
  unit: string;
  location?: string;
  assignee?: string;
  status: WorkStatus;
  dueDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  note?: string;
  attachments?: string[];
  createdAt: Date;
}

// 내 작업
export interface MyTask {
  id: string;
  workOrderId: string;
  type: WorkType;
  title: string;
  description?: string;
  productName: string;
  quantity: number;
  unit: string;
  location?: string;
  status: WorkStatus;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  barcode?: string;
  qrCode?: string;
  note?: string;
  attachments?: string[];
  createdAt: Date;
}

// Ops 보드 통계
export interface OpsStats {
  inbound: {
    planned: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  outbound: {
    planned: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  packing: {
    planned: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

