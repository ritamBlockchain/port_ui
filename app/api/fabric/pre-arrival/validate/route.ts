import { submitTransactionWithTxId, evaluateTransaction } from '@/lib/fabric/connection';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { submissionId } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ success: false, error: 'Submission ID is required' }, { status: 400 });
    }

    console.log(`[Fabric] Calling ValidateCompliance for ${submissionId}`);
    
    // Contract: ValidateCompliance(ctx, submissionId)
    const { txId } = await submitTransactionWithTxId('ValidateCompliance', submissionId.toString());

    // Re-fetch the updated submission to return current state
    let updatedSubmission = null;
    try {
      const getResult = await evaluateTransaction('GetPreArrival', submissionId);
      updatedSubmission = JSON.parse(getResult.toString());
    } catch (e) {
      console.warn('Could not re-fetch submission after validation:', e);
    }

    return NextResponse.json({
      success: true,
      txId,
      data: updatedSubmission,
      message: 'Automated compliance validation triggered and recorded on ledger'
    });
  } catch (error: any) {
    console.error('Fabric Error (ValidateCompliance):', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to validate compliance' 
    }, { status: 500 });
  }
}
