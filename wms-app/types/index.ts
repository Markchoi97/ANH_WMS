// 제품 구분 타입
export type ProductKind = 'ORIGINAL' | 'BUNDLE' | 'SET';

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
  // 번들/세트 관련 필드
  baseName?: string;
  packCode?: string;
  packMultiplier?: number;
  productKind?: ProductKind;
  isActive?: boolean;
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

// ====================================================================
// 주문 업로드 & 배송연동
// ====================================================================

export interface Order {
  id: string;
  orderNo: string;
  userId?: string;
  countryCode?: string;
  productName?: string;
  remark?: string;
  logisticsCompany?: 'CJ' | 'ANH' | 'INTL';
  trackingNo?: string;
  status: 'CREATED' | 'PUSHED' | 'SYNCED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  receiver?: OrderReceiver;
}

export interface OrderReceiver {
  id: string;
  orderId: string;
  name: string;
  phone?: string;
  zip?: string;
  address1?: string;
  address2?: string;
  locality?: string;
  countryCode?: string;
  meta?: any;
  createdAt: Date;
}

export interface OrderSender {
  id: string;
  name: string;
  phone?: string;
  zip?: string;
  address?: string;
  addressDetail?: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface LogisticsApiLog {
  id: string;
  orderId: string;
  adapter: 'CJ' | 'ANH' | 'INTL';
  direction: 'REQUEST' | 'RESPONSE';
  status: 'S' | 'E' | 'F';
  httpCode?: number;
  headers?: any;
  body?: any;
  createdAt: Date;
}

export interface TelParts {
  a: string;
  b: string;
  c: string;
}

export interface ParsedAddress {
  countryCode: string;
  address1: string;
  address2: string;
  postcode: string;
  locality: string;
  phoneIntl: string;
}

export interface CJRegBookPayload {
  order: {
    orderNo: string;
    trackingNo: string;
    items: Array<{
      name: string;
      qty: number;
      unit: string;
      amountKRW: number;
    }>;
    remark?: string;
    createdAt?: string;
  };
  sender: {
    name: string;
    tel: TelParts;
    zip: string;
    addr: string;
    addrDetail: string;
  };
  receiver: {
    name: string;
    tel: TelParts;
    zip: string;
    addr: string;
    addrDetail: string;
  };
  options: {
    printFlag: string;
    deliveryType: string;
    boxType: string;
    boxQty: number;
    freight: number;
  };
}

export interface CJRegBookResponse {
  result: 'S' | 'E' | 'F';
  invoiceNo?: string;
  cj?: {
    RESULT_CD: string;
    RESULT_DETAIL: string;
  };
  echo?: {
    orderNo: string;
  };
}

// ========================================
// 번들/세트 재고 관리 타입
// ========================================

// 작업 유형
export type MovementType = 'INBOUND' | 'OUTBOUND' | 'ADJUST' | 'BUNDLE' | 'UNBUNDLE' | 'LABEL';

// 사유 카테고리
export type ReasonCategory = 'INBOUND' | 'OUTBOUND' | 'ADJUST' | 'PROCESS';

// 사유 코드
export interface ReasonCode {
  code: string;
  label: string;
  category: ReasonCategory;
  isActive: boolean;
  createdAt: Date;
}

// 번들 구성품
export interface BundleComponent {
  id: string;
  bundleSku: string;
  componentSku: string;
  qtyPerBundle: number;
  createdAt: Date;
}

// 재고
export interface Inventory {
  sku: string;
  qty: number;
  updatedAt: Date;
}

// 작업 헤더
export interface Movement {
  id: string;
  movementType: MovementType;
  channel?: string;
  reasonCode?: string;
  memo?: string;
  movedAt: Date;
  createdBy?: string;
  createdAt: Date;
}

// 작업 라인
export interface MovementLine {
  id: string;
  movementId: string;
  sku: string;
  qtyChange: number;
  note?: string;
  createdAt: Date;
}

// 작업 효과 (번들/해체 시 자동 생성)
export interface MovementEffect {
  id: string;
  movementId: string;
  sourceSku: string;
  targetSku: string;
  qtyChange: number;
  note?: string;
  createdAt: Date;
}

// 현재 재고 뷰
export interface CurrentInventory {
  sku: string;
  name: string;
  baseName?: string;
  packCode?: string;
  packMultiplier?: number;
  productKind?: ProductKind;
  category: string;
  unit: string;
  location: string;
  qty: number;
  minStock: number;
  lastUpdated?: Date;
}

// 번들 구성 뷰
export interface BundleComposition {
  bundleSku: string;
  bundleName: string;
  packCode?: string;
  componentSku: string;
  componentName: string;
  qtyPerBundle: number;
  componentStock: number;
}

// 작업 이력 뷰
export interface MovementHistory {
  id: string;
  movementType: MovementType;
  channel?: string;
  reasonCode?: string;
  reasonLabel?: string;
  memo?: string;
  movedAt: Date;
  sku: string;
  productName: string;
  qtyChange: number;
  createdBy?: string;
  createdAt: Date;
}

// 작업 생성 요청
export interface CreateMovementRequest {
  movementType: MovementType;
  channel?: string;
  reasonCode?: string;
  memo?: string;
  movedAt?: Date;
  lines: {
    sku: string;
    qtyChange: number;
    note?: string;
  }[];
}

// 번들 생성 요청
export interface CreateBundleRequest {
  bundleSku: string;
  quantity: number;
  memo?: string;
}

// 번들 해체 요청
export interface UnbundleRequest {
  bundleSku: string;
  quantity: number;
  memo?: string;
}

// ========================================
// Global Fulfillment (해외배송) 타입
// ========================================

export type GlobalProcessStep = 
  | 'drop_shipping'
  | 'preparation'
  | 'wave_management'
  | 'second_sorting'
  | 'inspection'
  | 'package_check'
  | 'weight_check'
  | 'completed'
  | 'exception'
  | 'returned';

export type GlobalOrderStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'delayed'
  | 'error'
  | 'returned';

export type CustomsStatus = 
  | 'pending'
  | 'in_progress'
  | 'cleared'
  | 'delayed'
  | 'rejected';

// 고객사
export interface GlobalCustomer {
  id: string;
  partnerId?: string;
  name: string;
  countryCode: string; // 'CN', 'JP', 'KR' etc
  platform?: string; // 'Taobao', 'Shopify', 'Shopee' etc
  wechatId?: string;
  email?: string;
  phone?: string;
  notificationPreference?: {
    wechat: boolean;
    email: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 해외배송 주문
export interface GlobalFulfillmentOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  platformOrderId?: string;
  
  currentStep: GlobalProcessStep;
  status: GlobalOrderStatus;
  priority: number; // 1(높음) ~ 5(낮음)
  
  originCountry: string;
  destinationCountry: string;
  warehouseLocation?: string;
  transshipmentLocation?: string;
  
  shippingMethod?: string; // 'air', 'sea', 'express'
  carrier?: string;
  trackingNumber?: string;
  
  totalWeight?: number;
  totalVolume?: number;
  estimatedCost?: number;
  actualCost?: number;
  
  customsStatus?: CustomsStatus;
  customsClearedAt?: Date;
  
  orderedAt?: Date;
  receivedAt?: Date;
  packedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  notes?: string;
  metadata?: any;
  
  createdAt: Date;
  updatedAt: Date;
  
  // 관계
  customer?: GlobalCustomer;
  items?: GlobalOrderItem[];
  logs?: GlobalProcessLog[];
}

// 주문 상세 항목
export interface GlobalOrderItem {
  id: string;
  orderId: string;
  productId?: string;
  sku: string;
  productName: string;
  
  quantity: number;
  receivedQuantity: number;
  inspectedQuantity: number;
  damagedQuantity: number;
  missingQuantity: number;
  
  unitWeight?: number;
  unitPrice?: number;
  
  barcode?: string;
  qrCode?: string;
  
  status: string;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// 프로세스 로그
export interface GlobalProcessLog {
  id: string;
  orderId: string;
  step: string;
  action: string;
  status?: string;
  operatorId?: string;
  operatorName?: string;
  previousValue?: any;
  newValue?: any;
  message?: string;
  metadata?: any;
  createdAt: Date;
}

// 파도(Wave)
export interface GlobalWave {
  id: string;
  waveNumber: string;
  waveName?: string;
  waveType: string; // 'standard', '2B', '2S', 'pallet'
  shippingMethod?: string;
  carrier?: string;
  status: string; // 'planned', 'in_progress', 'sorting', 'completed', 'shipped'
  totalOrders: number;
  completedOrders: number;
  plannedShipDate?: Date;
  actualShipDate?: Date;
  cutoffTime?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 검수 기록
export interface GlobalInspection {
  id: string;
  orderId: string;
  itemId?: string;
  inspectionType: string; // 'quality', 'quantity', 'packaging'
  result: string; // 'pass', 'fail', 'partial'
  inspectorId?: string;
  inspectorName?: string;
  condition?: string; // 'normal', 'damaged', 'missing', 'incorrect'
  issueDescription?: string;
  photos?: string[]; // Image URLs
  actionTaken?: string; // 'approve', 'quarantine', 'return', 'dispose'
  inspectedAt: Date;
  notes?: string;
  metadata?: any;
  createdAt: Date;
}

// 패키지
export interface GlobalPackage {
  id: string;
  packageNumber: string;
  orderId?: string;
  waveId?: string;
  packageType?: string; // 'box', 'pallet', 'bag', '2B', '2S'
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  volume?: number;
  expectedWeight?: number;
  weightDifference?: number;
  weightVerified: boolean;
  trackingLabel?: string;
  barcode?: string;
  qrCode?: string;
  labelPrintedAt?: Date;
  status: string; // 'pending', 'packed', 'labeled', 'verified', 'shipped'
  packedBy?: string;
  packedAt?: Date;
  verifiedAt?: Date;
  shippedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 교환/반품
export interface GlobalReturn {
  id: string;
  returnNumber: string;
  orderId: string;
  returnType: string; // 'return', 'exchange'
  reason: string;
  reasonDetail?: string;
  items?: any[];
  status: string; // 'requested', 'approved', 'rejected', 'received', 'refunded', 'exchanged', 'disposed'
  requestedBy?: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  receivedAt?: Date;
  processedAt?: Date;
  refundAmount?: number;
  restockingFee?: number;
  returnShippingCost?: number;
  returnToInventory: boolean;
  disposalReason?: string;
  photos?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 이상 처리
export interface GlobalException {
  id: string;
  exceptionNumber: string;
  orderId?: string;
  exceptionType: string; // 'missing_item', 'duplicate', 'damaged', 'customs_delay', etc
  severity: string; // 'low', 'medium', 'high', 'critical'
  title: string;
  description?: string;
  detectedBy: string; // 'system', 'operator', 'customer'
  detectedAt: Date;
  status: string; // 'open', 'investigating', 'resolved', 'closed', 'escalated'
  assignedTo?: string;
  assignedAt?: Date;
  resolutionAction?: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  customerNotified: boolean;
  notificationSentAt?: Date;
  photos?: string[];
  attachments?: any[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// 마감 시간
export interface GlobalCutoff {
  id: string;
  cutoffName: string;
  carrier: string;
  cutoffType: string; // 'daily', 'weekly'
  cutoffTime: string;
  cutoffDays?: string[];
  warehouseLocation?: string;
  countryCode?: string;
  isActive: boolean;
  reminderMinutesBefore: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 대시보드 통계
export interface GlobalFulfillmentStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  delayedOrders: number;
  exceptionOrders: number;
  
  byStep: {
    [key in GlobalProcessStep]: number;
  };
  
  byCountry: {
    [countryCode: string]: number;
  };
  
  byCustomer: {
    customerId: string;
    customerName: string;
    orderCount: number;
  }[];
  
  topExceptions: {
    type: string;
    count: number;
    severity: string;
  }[];
  
  recentActivity: GlobalProcessLog[];
}

// Excel 업로드 데이터
export interface GlobalOrderImportRow {
  platformOrderId: string;
  customerName?: string;
  sku: string;
  productName: string;
  quantity: number;
  destinationCountry?: string;
  shippingMethod?: string;
  notes?: string;
}

