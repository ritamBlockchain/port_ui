import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const { action, logId, reason, resolution } = await req.json();

    if (!logId) {
      return NextResponse.json({ success: false, error: 'Service Log ID is required' }, { status: 400 });
    }

    let result;
    if (action === 'raise') {
      // RaiseServiceDispute(ctx, logId, reason)
      result = await submitTransaction('RaiseServiceDispute', logId, reason || 'No reason specified');
    } else if (action === 'resolve') {
      // ResolveServiceDispute(ctx, logId, resolution)
      result = await submitTransaction('ResolveServiceDispute', logId, resolution || 'Resolved by Port Authority');
    } else {
      return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Service dispute ${action === 'raise' ? 'raised' : 'resolved'} successfully`,
      txId: result.toString()
    });
  } catch (error: any) {
    console.error('Fabric Service Dispute Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
