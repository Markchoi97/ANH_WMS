// 작업(Movement) 관련 API 함수
import { supabase } from '../supabase';
import type {
  Movement,
  MovementLine,
  MovementEffect,
  CurrentInventory,
  BundleComposition,
  MovementHistory,
  CreateMovementRequest,
  CreateBundleRequest,
  UnbundleRequest,
  ReasonCode,
} from '@/types';

// ========================================
// 작업 (Movements)
// ========================================

/**
 * 모든 작업 조회
 */
export async function getMovements(): Promise<Movement[]> {
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .order('moved_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    movementType: row.movement_type,
    channel: row.channel,
    reasonCode: row.reason_code,
    memo: row.memo,
    movedAt: new Date(row.moved_at),
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
  }));
}

/**
 * 작업 단건 조회 (라인 포함)
 */
export async function getMovement(id: string): Promise<{ movement: Movement; lines: MovementLine[]; effects: MovementEffect[] }> {
  const { data: movementData, error: movementError } = await supabase
    .from('movements')
    .select('*')
    .eq('id', id)
    .single();

  if (movementError) throw movementError;

  const { data: linesData, error: linesError } = await supabase
    .from('movement_lines')
    .select('*')
    .eq('movement_id', id);

  if (linesError) throw linesError;

  const { data: effectsData, error: effectsError } = await supabase
    .from('movement_effects')
    .select('*')
    .eq('movement_id', id);

  if (effectsError) throw effectsError;

  const movement: Movement = {
    id: movementData.id,
    movementType: movementData.movement_type,
    channel: movementData.channel,
    reasonCode: movementData.reason_code,
    memo: movementData.memo,
    movedAt: new Date(movementData.moved_at),
    createdBy: movementData.created_by,
    createdAt: new Date(movementData.created_at),
  };

  const lines: MovementLine[] = (linesData || []).map((row) => ({
    id: row.id,
    movementId: row.movement_id,
    sku: row.sku,
    qtyChange: row.qty_change,
    note: row.note,
    createdAt: new Date(row.created_at),
  }));

  const effects: MovementEffect[] = (effectsData || []).map((row) => ({
    id: row.id,
    movementId: row.movement_id,
    sourceSku: row.source_sku,
    targetSku: row.target_sku,
    qtyChange: row.qty_change,
    note: row.note,
    createdAt: new Date(row.created_at),
  }));

  return { movement, lines, effects };
}

/**
 * 작업 생성 (+ 라인 + 자동 적용)
 */
export async function createMovement(request: CreateMovementRequest): Promise<Movement> {
  // 1. 작업 헤더 생성
  const { data: movementData, error: movementError } = await supabase
    .from('movements')
    .insert({
      movement_type: request.movementType,
      channel: request.channel,
      reason_code: request.reasonCode,
      memo: request.memo,
      moved_at: request.movedAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (movementError) throw movementError;

  // 2. 작업 라인 생성
  const lines = request.lines.map((line) => ({
    movement_id: movementData.id,
    sku: line.sku,
    qty_change: line.qtyChange,
    note: line.note,
  }));

  const { error: linesError } = await supabase
    .from('movement_lines')
    .insert(lines);

  if (linesError) throw linesError;

  // 3. 작업 적용 (Postgres 함수 호출)
  const { error: applyError } = await supabase.rpc('apply_movement', {
    mov_id: movementData.id,
  });

  if (applyError) throw applyError;

  return {
    id: movementData.id,
    movementType: movementData.movement_type,
    channel: movementData.channel,
    reasonCode: movementData.reason_code,
    memo: movementData.memo,
    movedAt: new Date(movementData.moved_at),
    createdBy: movementData.created_by,
    createdAt: new Date(movementData.created_at),
  };
}

/**
 * 작업 삭제
 */
export async function deleteMovement(id: string): Promise<void> {
  const { error } = await supabase
    .from('movements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================================
// 번들 생성/해체
// ========================================

/**
 * 번들 생성 (원품 → 번들)
 */
export async function createBundle(request: CreateBundleRequest): Promise<Movement> {
  return await createMovement({
    movementType: 'BUNDLE',
    reasonCode: 'BUNDLE_CREATE',
    memo: request.memo || `번들 생성: ${request.bundleSku} x ${request.quantity}`,
    lines: [
      {
        sku: request.bundleSku,
        qtyChange: request.quantity,
      },
    ],
  });
}

/**
 * 번들 해체 (번들 → 원품)
 */
export async function unbundle(request: UnbundleRequest): Promise<Movement> {
  return await createMovement({
    movementType: 'UNBUNDLE',
    reasonCode: 'BUNDLE_BREAK',
    memo: request.memo || `번들 해체: ${request.bundleSku} x ${request.quantity}`,
    lines: [
      {
        sku: request.bundleSku,
        qtyChange: -request.quantity, // 음수로 감소
      },
    ],
  });
}

// ========================================
// 재고 조회
// ========================================

/**
 * 현재 재고 조회 (뷰 사용)
 */
export async function getCurrentInventory(): Promise<CurrentInventory[]> {
  const { data, error } = await supabase
    .from('v_current_inventory')
    .select('*')
    .order('base_name', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    sku: row.sku,
    name: row.name,
    baseName: row.base_name,
    packCode: row.pack_code,
    packMultiplier: row.pack_multiplier,
    productKind: row.product_kind,
    category: row.category,
    unit: row.unit,
    location: row.location,
    qty: row.qty,
    minStock: row.min_stock,
    lastUpdated: row.last_updated ? new Date(row.last_updated) : undefined,
  }));
}

/**
 * 특정 SKU 재고 조회
 */
export async function getInventoryBySku(sku: string): Promise<number> {
  const { data, error } = await supabase
    .from('inventory')
    .select('qty')
    .eq('sku', sku)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return 0; // 데이터 없음
    throw error;
  }

  return data.qty;
}

// ========================================
// 번들 구성 조회
// ========================================

/**
 * 번들 구성 조회 (뷰 사용)
 */
export async function getBundleCompositions(): Promise<BundleComposition[]> {
  const { data, error } = await supabase
    .from('v_bundle_composition')
    .select('*')
    .order('bundle_name', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    bundleSku: row.bundle_sku,
    bundleName: row.bundle_name,
    packCode: row.pack_code,
    componentSku: row.component_sku,
    componentName: row.component_name,
    qtyPerBundle: row.qty_per_bundle,
    componentStock: row.component_stock,
  }));
}

/**
 * 특정 번들의 구성 조회
 */
export async function getBundleComponentsBySku(bundleSku: string): Promise<BundleComposition[]> {
  const { data, error } = await supabase
    .from('v_bundle_composition')
    .select('*')
    .eq('bundle_sku', bundleSku);

  if (error) throw error;

  return (data || []).map((row) => ({
    bundleSku: row.bundle_sku,
    bundleName: row.bundle_name,
    packCode: row.pack_code,
    componentSku: row.component_sku,
    componentName: row.component_name,
    qtyPerBundle: row.qty_per_bundle,
    componentStock: row.component_stock,
  }));
}

// ========================================
// 작업 이력 조회
// ========================================

/**
 * 작업 이력 조회 (뷰 사용)
 */
export async function getMovementHistory(limit = 100): Promise<MovementHistory[]> {
  const { data, error } = await supabase
    .from('v_movement_history')
    .select('*')
    .order('moved_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    movementType: row.movement_type,
    channel: row.channel,
    reasonCode: row.reason_code,
    reasonLabel: row.reason_label,
    memo: row.memo,
    movedAt: new Date(row.moved_at),
    sku: row.sku,
    productName: row.product_name,
    qtyChange: row.qty_change,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
  }));
}

/**
 * 특정 SKU의 작업 이력 조회
 */
export async function getMovementHistoryBySku(sku: string, limit = 50): Promise<MovementHistory[]> {
  const { data, error } = await supabase
    .from('v_movement_history')
    .select('*')
    .eq('sku', sku)
    .order('moved_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    movementType: row.movement_type,
    channel: row.channel,
    reasonCode: row.reason_code,
    reasonLabel: row.reason_label,
    memo: row.memo,
    movedAt: new Date(row.moved_at),
    sku: row.sku,
    productName: row.product_name,
    qtyChange: row.qty_change,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
  }));
}

// ========================================
// 사유 코드
// ========================================

/**
 * 사유 코드 조회
 */
export async function getReasonCodes(): Promise<ReasonCode[]> {
  const { data, error } = await supabase
    .from('reason_codes')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('label', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    code: row.code,
    label: row.label,
    category: row.category,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
  }));
}

