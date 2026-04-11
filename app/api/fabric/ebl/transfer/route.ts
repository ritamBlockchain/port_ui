import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const { eblId, toHolder, notes } = await req.json();

    if (!eblId || !toHolder) {
      return NextResponse.json({ success: false, error: 'eBL ID and new holder are required' }, { status: 400 });
    }

    console.log(`Transferring eBL ${eblId} to ${toHolder} on ledger...`);
    
    // contract function: TransferEBL(ctx, eblId, toHolder, notes)
    const result = await submitTransaction('TransferEBL', eblId, toHolder, notes || '');
    
    return NextResponse.json({ 
      success: true, 
      message: `eBL ${eblId} successfully transferred to ${toHolder}.`,
      txId: result.toString()
    });
  } catch (error: any) {
    console.error('Fabric eBL Transfer Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to transfer eBL on blockchain'
    }, { status: 500 });
  }
}
