-- ========================================
-- 번들/세트 재고 관리 테이블 설치 확인 스크립트
-- ========================================

-- 1. 테이블 목록 확인
SELECT 
  '✅ 설치된 테이블' as status,
  tablename as table_name
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'bundle_components',
    'inventory',
    'reason_codes',
    'movements',
    'movement_lines',
    'movement_effects'
  )
ORDER BY tablename;

-- 2. 뷰 목록 확인
SELECT 
  '✅ 설치된 뷰' as status,
  viewname as view_name
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN (
    'v_current_inventory',
    'v_bundle_composition',
    'v_movement_history'
  )
ORDER BY viewname;

-- 3. 데이터 카운트 확인
SELECT 
  '✅ 데이터 확인' as status,
  (SELECT COUNT(*) FROM bundle_components) as bundle_components_count,
  (SELECT COUNT(*) FROM inventory) as inventory_count,
  (SELECT COUNT(*) FROM reason_codes) as reason_codes_count,
  (SELECT COUNT(*) FROM movements) as movements_count,
  (SELECT COUNT(*) FROM movement_lines) as movement_lines_count,
  (SELECT COUNT(*) FROM movement_effects) as movement_effects_count;

-- 4. 샘플 재고 조회
SELECT 
  '✅ 현재 재고 샘플' as status,
  sku,
  name,
  product_kind,
  qty,
  location
FROM v_current_inventory
LIMIT 5;

-- 5. 번들 구성 확인
SELECT 
  '✅ 번들 구성 샘플' as status,
  bundle_sku,
  bundle_name,
  component_sku,
  component_name,
  qty_per_bundle
FROM v_bundle_composition
LIMIT 5;

-- 완료 메시지
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' 
          AND tablename IN ('bundle_components', 'inventory', 'movements')) = 3
    THEN '✅ 번들/재고 관리 시스템이 정상적으로 설치되었습니다!'
    ELSE '❌ 일부 테이블이 누락되었습니다. 스키마를 다시 실행해주세요.'
  END as installation_status;

