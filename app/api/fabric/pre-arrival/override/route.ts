import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const { submissionId, newStatus, reason } = await req.json();

    if (!submissionId || !newStatus || !reason) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // OverrideCompliance(ctx, submissionId, newStatus, reason)
    const result = await submitTransaction('OverrideCompliance', submissionId, newStatus, reason);

    return NextResponse.json({ 
      success: true, 
      message: 'Compliance override successful',
      txId: result.toString()
    });
  } catch (error: any) {
    console.error('Fabric OverrideCompliance error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
