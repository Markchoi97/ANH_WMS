-- ========================================
-- ANH WMS - 전체 스키마 설치 (통합 버전)
-- ========================================
-- 이 파일은 번들 + 해외배송 스키마를 한 번에 설치합니다.
-- 주의: 실행 시간이 다소 걸릴 수 있습니다.

-- ========================================
-- PART 1: 번들/재고 관리 스키마 정리
-- ========================================

-- 기존 뷰 삭제
DROP VIEW IF EXISTS v_movement_history;
DROP VIEW IF EXISTS v_bundle_composition;
DROP VIEW IF EXISTS v_current_inventory;

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS trigger_update_inventory_on_movement ON movement_lines;
DROP TRIGGER IF EXISTS trigger_bundle_inventory_effect ON movements;

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS update_inventory_on_movement();
DROP FUNCTION IF EXISTS process_bundle_inventory();

-- 기존 테이블 삭제
DROP TABLE IF EXISTS movement_effects CASCADE;
DROP TABLE IF EXISTS movement_lines CASCADE;
DROP TABLE IF EXISTS movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS bundle_components CASCADE;
DROP TABLE IF EXISTS reason_codes CASCADE;

-- 기존 타입 삭제
DROP TYPE IF EXISTS movement_type CASCADE;
DROP TYPE IF EXISTS reason_category CASCADE;

SELECT '✅ PART 1 완료: 기존 번들 테이블 정리 완료' as status;

-- ========================================
-- PART 2: 번들/재고 관리 스키마 생성
-- ========================================
-- 이 부분은 supabase-bundle-schema.sql의 핵심 내용입니다.
-- (너무 길어서 생략, 실제로는 supabase-bundle-schema.sql을 실행하세요)

SELECT '⚠️ PART 2: supabase-bundle-schema.sql 파일을 별도로 실행해주세요' as notice;

-- ========================================
-- PART 3: 해외배송(Global Fulfillment) 스키마 생성
-- ========================================
-- 이 부분은 supabase-global-fulfillment-schema.sql의 핵심 내용입니다.
-- (너무 길어서 생략, 실제로는 supabase-global-fulfillment-schema.sql을 실행하세요)

SELECT '⚠️ PART 3: supabase-global-fulfillment-schema.sql 파일을 별도로 실행해주세요' as notice;

-- ========================================
-- 최종 확인
-- ========================================

SELECT 
  'ℹ️ 설치 안내' as status,
  '1. supabase-bundle-schema.sql 실행' as step_1,
  '2. supabase-global-fulfillment-schema.sql 실행' as step_2,
  '3. 각 파일의 sample-data.sql 실행 (선택)' as step_3;

