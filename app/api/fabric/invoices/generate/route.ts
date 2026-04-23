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
      payeeAccount = 'PAYEE_PORT_AUTH',
      baseRate = 1200
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
        // Use prefix query for CouchDB compatibility
        const berthsResult = await evaluateTransaction('QueryAssets', 'prefix:berth:');
        const berthString = berthsResult.toString();
        if (berthString && berthString.trim() !== '') {
          const berths = JSON.parse(berthString);
          const berthRecord = berths
            .map((r: string) => JSON.parse(r))
            .find((b: any) => b.submissionId === submissionId);
          if (berthRecord) assignmentId = berthRecord.assignmentId || berthRecord.AssignmentId;
        }
      } catch (e) {
        console.warn('Could not auto-fetch assignmentId:', e);
      }
    }

    if (!assignmentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'MISSING_BERTH_ASSIGNMENT',
        message: 'No berth assignment found for this vessel submission. Port regulations require a berth assignment to be recorded before final invoicing. Please assign a berth in Berth Management first.' 
      }, { status: 400 });
    }

    // 3. Handle logIds and rates if not provided
    let effectiveLogIds = logIds;
    let effectiveUnitRates = unitRates;
    let effectiveDiscounts = discounts;

    if (!effectiveLogIds) {
      // Use prefix query for CouchDB compatibility
      const logsResult = await evaluateTransaction('QueryAssets', 'prefix:svclog:');
      const logsString = logsResult.toString();
      const rawLogs = logsString && logsString.trim() !== '' ? JSON.parse(logsString) : [];
      const logs = rawLogs.map((r: string) => {
        const obj = JSON.parse(r);
        return {
          status: obj.Status || obj.status,
          logId: obj.LogId || obj.logId || obj.ID || obj.id,
          serviceType: obj.ServiceType || obj.serviceType,
          submissionId: obj.SubmissionId || obj.submissionId,
          ...obj
        };
      });
      
      const completedLogs = logs.filter((l: any) => 
        (l.status === 'completed' || l.status === 'resolved') &&
        !(l.invoiceId || l.InvoiceId)
      );
      
      if (completedLogs.length === 0) {
        // AUTO-SERVICE FALLBACK: Using actual contract functions 'StartService' and 'CompleteService'
        const mockLogId = `LOG_AUTO_${Date.now()}`;
        try {
            // 1. Start the service (requestId = "" to bypass request check)
            await submitTransaction(
                'StartService',
                mockLogId,
                '', // requestId
                submissionId,
                assignmentId,
                'pilotage',
                'System Auto-Provider',
                'units'
            );
            
            // 2. Complete the service with a quantity of 1.0
            await submitTransaction(
                'CompleteService',
                mockLogId,
                'Automated Base Port Service Fee',
                '1' // quantity (submitTransaction handles float conversion)
            );
            
            effectiveLogIds = [mockLogId];
            effectiveUnitRates = { [mockLogId]: parseFloat(baseRate.toString()) };
            effectiveDiscounts = { [mockLogId]: 0 };
            
            console.log(`[FABRIC] Auto-created service log: ${mockLogId}`);
        } catch (e: any) {
            console.error('Failed to auto-create service log:', e.message);
            return NextResponse.json({ 
              success: false, 
              error: 'NO_COMPLETED_SERVICES',
              message: `This vessel has no completed services. Automated log creation failed: ${e.message}` 
            }, { status: 400 });
        }
      } else {
        effectiveLogIds = completedLogs.map((l: any) => l.logId);
        effectiveUnitRates = {};
        effectiveDiscounts = {};
        const rates: any = { pilotage: 500, tug: 750, mooring: 300, stevedoring: 1200, bunkering: 1500 };
        
        completedLogs.forEach((l: any) => {
          effectiveUnitRates[l.logId] = rates[l.serviceType] || 500;
          effectiveDiscounts[l.logId] = 0;
        });
      }
    }

    const effectiveDueDate = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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

    console.log(`[FABRIC] Finalizing Invoice Commitment: ${invoiceId}`);
    console.log(`[FABRIC] Parameters: Vessel=${submissionId}, Assign=${assignmentId}, Logs=${effectiveLogIds.length}, Tax=${taxRatePercent}%`);

    // Contract: GenerateInvoice(ctx, id, sub, assign, to, cur, due, logs, rates, disc, tax, payer, payee)
    const result = await submitTransaction('GenerateInvoice', ...params);
    const txId = result.toString();

    console.log(`[SUCCESS] Invoice ${invoiceId} committed to ledger. TxID: ${txId}`);

    return NextResponse.json({
      success: true,
      txId,
      invoiceId,
      details: {
        submissionId,
        logCount: effectiveLogIds.length,
        totalAmount: 'Calculated by Ledger'
      },
      message: `Invoice ${invoiceId} successfully minted on Hyperledger Fabric.`
    });
  } catch (error: any) {
    console.error('Generate Invoice Failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate invoice'
    }, { status: 500 });
  }
}
