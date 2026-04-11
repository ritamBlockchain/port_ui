import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const { logId, resolution } = await req.json();

    if (!logId || !resolution) {
      return NextResponse.json({ success: false, error: 'Log ID and resolution details are required' }, { status: 400 });
    }

    console.log(`Resolving dispute for log ${logId} on ledger...`);
    
    // contract function: ResolveServiceDispute(ctx, logId, resolution)
    const result = await submitTransaction('ResolveServiceDispute', logId, resolution);
    
    return NextResponse.json({ 
      success: true, 
      message: `Dispute for service log ${logId} has been resolved.`,
      txId: result.toString()
    });
  } catch (error: any) {
    console.error('Fabric Resolve Disorder Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to resolve dispute on blockchain'
    }, { status: 500 });
  }
}
