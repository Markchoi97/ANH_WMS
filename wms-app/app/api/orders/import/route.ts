import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { parseAddress, splitTel3KR } from '@/services/address/parse';
import { pickCarrier } from '@/services/logistics/assign';
import { cjRegBookCall } from '@/services/logistics/cjClient';
import { supabase } from '@/lib/supabase';
import { getDefaultSender } from '@/lib/api/orders';

/**
 * 주문 엑셀 업로드 & 자동 배송사 배정 API
 * 
 * POST /api/orders/import
 * - FormData로 Excel 파일 업로드
 * - 국가별 주소 파싱
 * - CJ/ANH/INTL 자동 배정
 * - CJ인 경우 브리지 API 호출
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // Excel 파일 파싱
    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: '엑셀 파일에 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // 기본 발송인 정보 가져오기
    const sender = await getDefaultSender();

    let successCount = 0;
    const failed: any[] = [];

    // 각 행 처리
    for (const r of rows) {
      try {
        // 필수 필드 추출 (중문 엑셀 헤더 기준)
        const orderNo = String(r['订单号'] || r['주문번호'] || '').trim();
        const recvName = String(r['收件人姓名'] || r['수취인'] || '').trim();
        const recvPhone = String(r['收件人电话'] || r['전화번호'] || '').trim();
        const recvAddr = String(r['收件地址'] || r['주소'] || '').trim();
        const recvZip = String(r['收件人邮编'] || r['우편번호'] || '').trim();
        const productName = String(r['商品名称'] || r['상품명'] || '상품');
        const remark = String(r['备注'] || r['비고'] || '');

        if (!orderNo || !recvName || !recvPhone || !recvAddr) {
          throw new Error('필수값 누락 (주문번호, 수취인, 전화번호, 주소)');
        }

        // 중복 체크
        const { data: existing } = await supabase
          .from('orders')
          .select('id')
          .eq('order_no', orderNo)
          .maybeSingle();

        if (existing) {
          throw new Error('중복 주문번호');
        }

        // 주소 파싱
        const parsed = parseAddress(recvAddr, recvPhone, recvZip);

        // 배송사 자동 배정
        const carrier = pickCarrier(parsed.countryCode);

        // 주문 생성
        const { data: orderRow, error: oErr } = await supabase
          .from('orders')
          .insert({
            order_no: orderNo,
            country_code: parsed.countryCode,
            product_name: productName,
            remark,
            logistics_company: carrier,
            status: 'CREATED',
          })
          .select()
          .single();

        if (oErr) throw oErr;

        // 수취인 정보 저장
        const { error: rcErr } = await supabase
          .from('order_receivers')
          .insert({
            order_id: orderRow.id,
            name: recvName,
            phone: parsed.phoneIntl || recvPhone,
            zip: parsed.postcode || recvZip,
            address1: parsed.address1,
            address2: parsed.address2,
            locality: parsed.locality || null,
            country_code: parsed.countryCode,
            meta:
              parsed.countryCode === 'CN'
                ? { cn_mapped: parsed }
                : {},
          });

        if (rcErr) throw rcErr;

        // CJ 배정이면 브리지 호출 (환경변수 체크)
        if (
          carrier === 'CJ' &&
          process.env.CJ_BRIDGE_BASE &&
          process.env.CJ_BRIDGE_SECRET
        ) {
          const tel = splitTel3KR(parsed.phoneIntl || recvPhone);
          const senderTel = splitTel3KR(sender.phone || '010-0000-0000');

          const payload = {
            order: {
              orderNo,
              trackingNo: '',
              items: [
                {
                  name: productName || 'Goods',
                  qty: 1,
                  unit: 'EA',
                  amountKRW: 15000,
                },
              ],
              remark,
              createdAt: new Date().toISOString(),
            },
            sender: {
              name: sender.name,
              tel: senderTel,
              zip: sender.zip || '',
              addr: sender.address || '',
              addrDetail: sender.addressDetail || '',
            },
            receiver: {
              name: recvName,
              tel,
              zip: parsed.postcode || recvZip,
              addr: parsed.address1,
              addrDetail: parsed.address2 || '',
            },
            options: {
              printFlag: '02',
              deliveryType: '01',
              boxType: '01',
              boxQty: 1,
              freight: 6250,
            },
          };

          const bridge = await cjRegBookCall(
            process.env.CJ_BRIDGE_BASE!,
            payload,
            process.env.CJ_BRIDGE_SECRET!
          );

          // 로그 저장
          await supabase.from('logistics_api_logs').insert({
            order_id: orderRow.id,
            adapter: 'CJ',
            direction: 'RESPONSE',
            status: bridge.data?.result ?? 'F',
            http_code: bridge.status,
            body: bridge.data,
          });

          if (bridge.data?.result !== 'S') {
            await supabase
              .from('orders')
              .update({ status: 'FAILED' })
              .eq('id', orderRow.id);
            throw new Error(
              bridge.data?.cj?.RESULT_DETAIL || 'CJ 전송 실패'
            );
          }

          // 성공 시 송장번호 업데이트
          await supabase
            .from('orders')
            .update({
              status: 'SYNCED',
              tracking_no: bridge.data.invoiceNo ?? null,
            })
            .eq('id', orderRow.id);
        }

        successCount++;
      } catch (e: any) {
        console.error('주문 처리 실패:', r['订单号'] || r['주문번호'], e);
        failed.push({
          orderNo: r['订单号'] || r['주문번호'] || '?',
          reason: e.message,
        });
        continue;
      }
    }

    return NextResponse.json({
      successCount,
      failedCount: failed.length,
      failed: failed.slice(0, 50), // 최대 50개만 반환
    });
  } catch (error: any) {
    console.error('Import API Error:', error);
    return NextResponse.json(
      { error: error.message || '업로드 실패' },
      { status: 500 }
    );
  }
}

