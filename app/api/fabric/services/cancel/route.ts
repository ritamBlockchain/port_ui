import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const { logId, reason } = await req.json();

    if (!logId) {
      return NextResponse.json({ success: false, error: 'Service Log ID is required' }, { status: 400 });
    }

    console.log(`[Fabric] Cancelling Service ${logId}`);
    
    // CancelService(ctx, logId, reason)
    const result = await submitTransaction(
        'CancelService', 
        logId, 
        reason || 'Cancelled by user'
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Service cancelled successfully',
      txId: result.toString()
    });
  } catch (error: any) {
    console.error('Fabric CancelService error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to cancel service' 
    }, { status: 500 });
  }
}
