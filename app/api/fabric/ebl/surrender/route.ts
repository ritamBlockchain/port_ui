import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const { eblId } = await req.json();

    if (!eblId) {
      return NextResponse.json({ success: false, error: 'EBL ID is required' }, { status: 400 });
    }

    const result = await submitTransaction('SurrenderEBL', eblId);

    return NextResponse.json({ 
      success: true, 
      message: 'e-Bill of Lading surrendered to carrier successfully',
      txId: result.toString()
    });
  } catch (error: any) {
    console.error('Fabric EBL Surrender Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
