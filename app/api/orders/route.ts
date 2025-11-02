import { NextRequest, NextResponse } from 'next/server';
import { getOrders, deleteOrder } from '@/lib/api/orders';

/**
 * 주문 목록 조회 API
 * GET /api/orders?status=CREATED&logisticsCompany=CJ
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const logisticsCompany = searchParams.get('logisticsCompany') || undefined;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;

    const orders = await getOrders({
      status,
      logisticsCompany,
      limit,
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Get Orders Error:', error);
    return NextResponse.json(
      { error: error.message || '조회 실패' },
      { status: 500 }
    );
  }
}

/**
 * 주문 삭제 API
 * DELETE /api/orders?id=xxx
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '주문 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    await deleteOrder(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Order Error:', error);
    return NextResponse.json(
      { error: error.message || '삭제 실패' },
      { status: 500 }
    );
  }
}

