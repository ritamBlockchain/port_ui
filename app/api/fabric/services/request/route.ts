import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, submissionId, serviceType, notes } = body;

    console.log('[Service Request] Received:', { requestId, submissionId, serviceType, notes });

    if (!requestId || !submissionId || !serviceType) {
      console.error('[Service Request] Missing fields:', { requestId, submissionId, serviceType });
      return NextResponse.json(
        { error: 'Missing required fields: requestId, submissionId, serviceType' },
        { status: 400 }
      );
    }

    console.log('[Service Request] Calling chaincode RequestPortService...');
    const result = await submitTransaction(
      'RequestPortService',
      requestId,
      submissionId,
      serviceType,
      notes || ''
    );
    console.log('[Service Request] Chaincode response:', result.toString());

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Service request submitted successfully',
      txId: result.toString(),
    });
  } catch (error) {
    console.error('[Service Request] Error:', error);
    return NextResponse.json(
      { error: 'Failed to request service', details: String(error) },
      { status: 500 }
    );
  }
}
