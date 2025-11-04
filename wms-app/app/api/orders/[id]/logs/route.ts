import { NextRequest, NextResponse } from 'next/server';
import { getLogisticsLogs } from '@/lib/api/orders';

/**
 * 주문별 물류 API 로그 조회
 * GET /api/orders/[id]/logs
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logs = await getLogisticsLogs(id);
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Get Logistics Logs Error:', error);
    return NextResponse.json(
      { error: error.message || '조회 실패' },
      { status: 500 }
    );
  }
}

