-- ====================================================================
-- Ops 보드, My Tasks, 대시보드 샘플 데이터
-- ====================================================================

-- 입고 샘플 데이터
INSERT INTO inbounds (product_name, supplier_name, quantity, unit, unit_price, total_price, inbound_date, status) VALUES
('노트북 A', '테크 공급업체', 50, '개', 1200000, 60000000, NOW() - INTERVAL '2 days', 'completed'),
('무선 마우스', '테크 공급업체', 100, '개', 25000, 2500000, NOW() - INTERVAL '1 day', 'completed'),
('키보드', '테크 공급업체', 30, '개', 85000, 2550000, NOW(), 'pending'),
('모니터 27인치', '테크 공급업체', 20, '개', 350000, 7000000, NOW(), 'pending');

-- 출고 샘플 데이터
INSERT INTO outbounds (product_name, customer_name, quantity, unit, unit_price, total_price, outbound_date, status) VALUES
('노트북 A', 'ABC 전자', 10, '개', 1200000, 12000000, NOW() - INTERVAL '1 day', 'completed'),
('무선 마우스', 'ABC 전자', 25, '개', 25000, 625000, NOW() - INTERVAL '1 day', 'completed'),
('USB 케이블', 'ABC 전자', 50, '개', 5000, 250000, NOW(), 'pending'),
('모니터 27인치', 'ABC 전자', 5, '개', 350000, 1750000, NOW(), 'pending');

-- Work Orders 샘플 데이터 (Ops 보드용)
INSERT INTO work_orders (type, title, description, product_name, quantity, unit, location, assignee, status, due_date, started_at, completed_at) VALUES
('inbound', '노트북 입고 처리', '신규 노트북 50대 입고', '노트북 A', 50, '개', 'A-1-01', '김철수', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('inbound', '마우스 입고 처리', '무선 마우스 100개 입고', '무선 마우스', 100, '개', 'A-2-05', '김철수', 'completed', NOW(), NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours'),
('inbound', '키보드 입고 대기', '기계식 키보드 30개 입고 예정', '키보드', 30, '개', 'A-2-06', '이영희', 'in-progress', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '1 hour', NULL),
('inbound', '모니터 입고 예정', '27인치 모니터 20개 입고 예정', '모니터 27인치', 20, '개', 'B-1-03', '박민수', 'planned', NOW() + INTERVAL '4 hours', NULL, NULL),
('outbound', '노트북 출고 완료', 'ABC 전자 노트북 10대 출고', '노트북 A', 10, '개', 'A-1-01', '최수진', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('outbound', '마우스 출고 완료', 'ABC 전자 마우스 25개 출고', '무선 마우스', 25, '개', 'A-2-05', '최수진', 'completed', NOW(), NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour'),
('outbound', '케이블 출고 중', 'USB 케이블 50개 출고 진행중', 'USB 케이블', 50, '개', 'C-1-01', '정민호', 'in-progress', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', NULL),
('outbound', '모니터 출고 예정', '모니터 5대 출고 예정', '모니터 27인치', 5, '개', 'B-1-03', '강지혜', 'planned', NOW() + INTERVAL '3 hours', NULL, NULL),
('outbound', '긴급 출고 지연', '긴급 주문 처리 지연', '노트북 A', 3, '개', 'A-1-01', '최수진', 'overdue', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '3 hours', NULL),
('packing', '노트북 포장 완료', '노트북 10대 포장 완료', '노트북 A', 10, '개', 'PACK-01', '송하늘', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('packing', '마우스 포장 완료', '마우스 25개 포장 완료', '무선 마우스', 25, '개', 'PACK-02', '송하늘', 'completed', NOW(), NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
('packing', '케이블 포장 중', 'USB 케이블 50개 포장 중', 'USB 케이블', 50, '개', 'PACK-01', '윤서연', 'in-progress', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '20 minutes', NULL),
('packing', '모니터 포장 예정', '모니터 5대 포장 예정', '모니터 27인치', 5, '개', 'PACK-02', '송하늘', 'planned', NOW() + INTERVAL '2 hours', NULL, NULL);

-- My Tasks 샘플 데이터
INSERT INTO my_tasks (work_order_id, type, title, description, product_name, quantity, unit, location, status, due_date, priority, barcode, qr_code) VALUES
((SELECT id FROM work_orders WHERE title = '키보드 입고 대기' LIMIT 1), 'inbound', '키보드 입고 확인', '기계식 키보드 30개 입고 확인 필요', '키보드', 30, '개', 'A-2-06', 'in-progress', NOW() + INTERVAL '2 hours', 'high', 'KEY-001', 'QR-KEY-001'),
((SELECT id FROM work_orders WHERE title = '모니터 입고 예정' LIMIT 1), 'inbound', '모니터 입고 준비', '27인치 모니터 20개 입고 준비', '모니터 27인치', 20, '개', 'B-1-03', 'planned', NOW() + INTERVAL '4 hours', 'medium', 'MON-001', 'QR-MON-001'),
((SELECT id FROM work_orders WHERE title = '케이블 출고 중' LIMIT 1), 'outbound', 'USB 케이블 출고', 'USB 케이블 50개 출고 처리', 'USB 케이블', 50, '개', 'C-1-01', 'in-progress', NOW() + INTERVAL '1 hour', 'high', 'CAB-001', 'QR-CAB-001'),
((SELECT id FROM work_orders WHERE title = '모니터 출고 예정' LIMIT 1), 'outbound', '모니터 출고 준비', '모니터 5대 출고 준비', '모니터 27인치', 5, '개', 'B-1-03', 'planned', NOW() + INTERVAL '3 hours', 'medium', 'MON-001', 'QR-MON-001'),
((SELECT id FROM work_orders WHERE title = '케이블 포장 중' LIMIT 1), 'packing', '케이블 포장 작업', 'USB 케이블 50개 포장', 'USB 케이블', 50, '개', 'PACK-01', 'in-progress', NOW() + INTERVAL '1 hour', 'high', 'CAB-001', 'QR-CAB-001'),
((SELECT id FROM work_orders WHERE title = '모니터 포장 예정' LIMIT 1), 'packing', '모니터 포장 준비', '모니터 5대 포장 준비', '모니터 27인치', 5, '개', 'PACK-02', 'planned', NOW() + INTERVAL '2 hours', 'low', 'MON-001', 'QR-MON-001'),
((SELECT id FROM work_orders WHERE title = '노트북 포장 완료' LIMIT 1), 'packing', '노트북 포장 완료', '노트북 10대 포장 완료', '노트북 A', 10, '개', 'PACK-01', 'completed', NOW() - INTERVAL '1 day', 'medium', 'LAP-001', 'QR-LAP-001'),
((SELECT id FROM work_orders WHERE title = '마우스 포장 완료' LIMIT 1), 'packing', '마우스 포장 완료', '마우스 25개 포장 완료', '무선 마우스', 25, '개', 'PACK-02', 'completed', NOW(), 'medium', 'MOU-001', 'QR-MOU-001');

