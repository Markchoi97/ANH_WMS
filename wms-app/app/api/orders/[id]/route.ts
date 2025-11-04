import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/api/orders';

/**
 * 주문 상세 조회 API
 * GET /api/orders/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrder(id);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Get Order Detail Error:', error);
    return NextResponse.json(
      { error: error.message || '조회 실패' },
      { status: 500 }
    );
  }
}

