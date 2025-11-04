-- ========================================
-- 번들/세트 재고 관리 테이블 완전 삭제 스크립트
-- ========================================
-- 주의: 이 스크립트는 모든 데이터를 삭제합니다!
-- 실행 전 백업을 권장합니다.

-- 1. 뷰 삭제
DROP VIEW IF EXISTS v_movement_history;
DROP VIEW IF EXISTS v_bundle_composition;
DROP VIEW IF EXISTS v_current_inventory;

-- 2. 트리거 삭제
DROP TRIGGER IF EXISTS trigger_update_inventory_on_movement ON movement_lines;
DROP TRIGGER IF EXISTS trigger_bundle_inventory_effect ON movements;

-- 3. 함수 삭제
DROP FUNCTION IF EXISTS update_inventory_on_movement();
DROP FUNCTION IF EXISTS process_bundle_inventory();

-- 4. 테이블 삭제 (의존성 순서대로)
DROP TABLE IF EXISTS movement_effects CASCADE;
DROP TABLE IF EXISTS movement_lines CASCADE;
DROP TABLE IF EXISTS movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS bundle_components CASCADE;
DROP TABLE IF EXISTS reason_codes CASCADE;

-- 5. 타입 삭제
DROP TYPE IF EXISTS movement_type CASCADE;
DROP TYPE IF EXISTS reason_category CASCADE;

-- 완료 메시지
SELECT '✅ 번들/재고 관리 테이블이 모두 삭제되었습니다.' as status;

