import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction, evaluateTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      submissionId,
      serviceType,
      providerName,
      requestId = '',
      quantityUnit = 'hours'
    } = body;

    if (!submissionId || !serviceType) {
      return NextResponse.json({ success: false, error: 'submissionId and serviceType are required' }, { status: 400 });
    }

    // 1. Auto-generate logId
    const logId = `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 2. Auto-fetch assignmentId if not provided
    let assignmentId = body.assignmentId || '';
    if (!assignmentId) {
      try {
        const berthsResult = await evaluateTransaction('QueryAssets', `{"selector":{"submissionId":"${submissionId}"}}`);
        const berths = JSON.parse(berthsResult.toString());
        if (berths && berths.length > 0) {
          const berthRecord = berths.map((r: string) => JSON.parse(r)).find((b: any) => b.assignmentId);
          if (berthRecord) assignmentId = berthRecord.assignmentId;
        }
      } catch (e) {
        console.warn('Could not auto-fetch assignmentId for service:', e);
      }
    }

    // If still no assignmentId, we cannot start the service as the contract expects a valid ID
    if (!assignmentId) {
       return NextResponse.json({ 
         success: false, 
         error: `No berth assignment found for submission ${submissionId}. Please assign a berth first.` 
       }, { status: 400 });
    }

    console.log(`[API] Starting Service ${serviceType} for ${submissionId} (Log: ${logId})`);

    // ENSURE ALL 7 PARAMS ARE STRINGS
    const params = [
      logId.toString(),
      requestId.toString(),
      submissionId.toString(),
      assignmentId.toString(),
      serviceType.toString(),
      (providerName || 'PROVIDER').toString(),
      quantityUnit.toString()
    ];

    // Contract: StartService(ctx, logId, requestId, submissionId, assignmentId, serviceTypeStr, providerName, quantityUnit)
    const result = await submitTransaction('StartService', ...params);

    return NextResponse.json({
      success: true,
      txId: result.toString(),
      logId,
      message: 'Service started successfully'
    });
  } catch (error: any) {
    console.error('Start Service Failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to start service'
    }, { status: 500 });
  }
}
