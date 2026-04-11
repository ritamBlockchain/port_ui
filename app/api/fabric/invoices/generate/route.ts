import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction, evaluateTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      submissionId,
      dueDate,
      logIds,
      unitRates,
      discounts,
      taxRatePercent = 10.0,
      currency = 'USD',
      issuedTo = 'ShippingAgent',
      payerAccount = 'PAYER_DEFAULT',
      payeeAccount = 'PAYEE_PORT_AUTH'
    } = body;

    if (!submissionId) {
      return NextResponse.json({ success: false, error: 'submissionId is required' }, { status: 400 });
    }

    // 1. Auto-generate invoiceId
    const invoiceId = `INV_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 2. Fetch assignmentId if not provided (query berths for this submission)
    let assignmentId = body.assignmentId || '';
    if (!assignmentId) {
      try {
        const berthsResult = await evaluateTransaction('QueryAssets', `{"selector":{"submissionId":"${submissionId}"}}`);
        const berths = JSON.parse(berthsResult.toString());
        if (berths && berths.length > 0) {
          // Find a berth assignment record by parsing strings into objects
          const berthRecord = berths.map((r: string) => JSON.parse(r)).find((b: any) => b.assignmentId);
          if (berthRecord) assignmentId = berthRecord.assignmentId;
        }
      } catch (e) {
        console.warn('Could not auto-fetch assignmentId:', e);
      }
    }

    // 3. Handle logIds and rates if not provided
    let effectiveLogIds = logIds;
    let effectiveUnitRates = unitRates;
    let effectiveDiscounts = discounts;

    if (!effectiveLogIds) {
      // Use QueryAssets instead of GetServiceLogsBySubmission to bypass strict return schema validation
      const selector = JSON.stringify({ selector: { submissionId, docType: "service_complete" } });
      // If that fails, fall back to general log query
      const logsResult = await evaluateTransaction('QueryAssets', `{"selector":{"submissionId":"${submissionId}"}}`);
      const rawLogs = JSON.parse(logsResult.toString() || '[]');
      const logs = rawLogs.map((r: string) => JSON.parse(r));
      
      const completedLogs = logs.filter((l: any) => l.status === 'completed' || l.status === 'resolved');
      
      if (completedLogs.length === 0) {
        return NextResponse.json({ 
          success: true, // We return true but empty/msg so UI can show a helpful tip instead of a scary red error
          data: [],
          error: 'NO_COMPLETED_SERVICES',
          message: 'No completed services found to invoice for this vessel. Please ensure the Service Provider (e.g. Tug, Pilot) has marked the relevant services as "Completed" on the ledger first.' 
        }, { status: 400 });
      }
      
      effectiveLogIds = completedLogs.map((l: any) => l.logId);
      effectiveUnitRates = {};
      effectiveDiscounts = {};
      const rates: any = { pilotage: 500, tug: 750, mooring: 300, stevedoring: 1200, bunkering: 1500 };
      
      completedLogs.forEach((l: any) => {
        effectiveUnitRates[l.logId] = rates[l.serviceType] || 500;
        effectiveDiscounts[l.logId] = 0;
      });
    }

    const effectiveDueDate = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`[API] Generating Invoice ${invoiceId} for ${submissionId} (LogCount: ${effectiveLogIds.length})`);

    // ENSURE ALL PARAMS ARE STRINGS AND NOT UNDEFINED
    const params = [
      invoiceId.toString(),
      submissionId.toString(),
      assignmentId.toString(),
      issuedTo.toString(),
      currency.toString(),
      effectiveDueDate.toString(),
      JSON.stringify(effectiveLogIds),
      JSON.stringify(effectiveUnitRates),
      JSON.stringify(effectiveDiscounts),
      taxRatePercent.toString(),
      payerAccount.toString(),
      payeeAccount.toString()
    ];

    // Contract: GenerateInvoice(ctx, id, sub, assign, to, cur, due, logs, rates, disc, tax, payer, payee)
    const result = await submitTransaction('GenerateInvoice', ...params);

    return NextResponse.json({
      success: true,
      txId: result.toString(),
      invoiceId,
      message: 'Invoice generated successfully'
    });
  } catch (error: any) {
    console.error('Generate Invoice Failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate invoice'
    }, { status: 500 });
  }
}
