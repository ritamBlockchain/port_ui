import { NextRequest, NextResponse } from 'next/server';
import { submitTransactionWithTxId, evaluateTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, agency, comments, approved } = body;

    const { txId } = await submitTransactionWithTxId(
      'ApproveSubmission', 
      submissionId, 
      agency, 
      comments, 
      approved ? 'true' : 'false'
    );

    // Re-fetch the updated submission to return current state
    let updatedSubmission = null;
    try {
      const getResult = await evaluateTransaction('GetPreArrival', submissionId);
      updatedSubmission = JSON.parse(getResult.toString());
    } catch (e) {
      console.warn('Could not re-fetch submission after approval:', e);
    }

    return NextResponse.json({ 
      success: true, 
      txId,
      data: updatedSubmission,
      message: `Agency "${agency}" approval recorded on ledger`
    });
  } catch (error: any) {
    console.error('Approval Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
