import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const logId = body.logId;
    const remarks = body.remarks || 'Service completed';
    const quantity = body.durationMins || body.quantity || 1.0;

    if (!logId) {
      return NextResponse.json({ success: false, error: 'logId is required' }, { status: 400 });
    }

    console.log(`[API] Completing Service ${logId} (Final Quantity: ${quantity})`);

    // Contract: CompleteService(ctx, logId, remarks string, quantity float64)
    const result = await submitTransaction(
      'CompleteService',
      logId.toString(),
      remarks.toString(),
      quantity.toString()
    );

    return NextResponse.json({
      success: true,
      txId: result.toString(),
      message: 'Service completed successfully'
    });
  } catch (error: any) {
    console.error('Complete Service Failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to complete service'
    }, { status: 500 });
  }
}
