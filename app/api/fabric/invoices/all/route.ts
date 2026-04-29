import { NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';
import { MOCK_INVOICES } from '@/lib/fabric/mock-data';

export async function GET() {
  try {
    // Try a multi-strategy approach to find invoices
    // 1. Try a selector query for rich search
    // 2. Fallback to a prefix query for raw key range
    let resultString = '';
    try {
      const selectorResult = await evaluateTransaction('QueryAssets', '{"selector":{"$or":[{"invoiceId":{"$gt":null}},{"InvoiceId":{"$gt":null}}]}}');
      resultString = selectorResult.toString();
    } catch (e) {
      console.warn('Selector query failed, falling back to prefix:', e);
    }

    if (!resultString || resultString === '[]' || resultString.trim() === '') {
      const prefixResult = await evaluateTransaction('QueryAssets', 'prefix:invoice:');
      resultString = prefixResult.toString();
    }
    
    if (!resultString || resultString.trim() === '' || resultString === '[]') {
      return NextResponse.json({ success: true, data: [] });
    }

    const rawData = JSON.parse(resultString);
    console.log(`[DEBUG] Found ${rawData.length} potential invoice records on ledger.`);

    const data = rawData.map((item: any) => {
      try {
        const obj = typeof item === 'string' ? JSON.parse(item) : item;
        if (!obj) return null;
        
        // Skip logs and payment-only metadata records
        if (obj.logId || obj.LogId || obj.bankRefNumber || obj.BankRefNumber) return null;

        // Force extraction of all key fields regardless of casing
        // We put ...obj FIRST so that our explicit mappings below OVERWRITE any messy ledger casing
        const mapped = {
          ...obj,
          invoiceId: obj.invoiceId || obj.InvoiceId || obj.ID || obj.id || "N/A",
          submissionId: obj.submissionId || obj.SubmissionId || "N/A",
          vesselIMO: obj.vesselIMO || obj.VesselIMO || "N/A",
          totalAmount: Number(obj.totalAmount || obj.TotalAmount || obj.amount || obj.Amount || 0),
          status: (obj.status || obj.Status || "issued").toLowerCase(),
          dueDate: obj.dueDate || obj.DueDate || "N/A",
          currency: obj.currency || obj.Currency || "USD",
          issuedAt: obj.issuedAt || obj.IssuedAt || "N/A",
          issuedTo: obj.issuedTo || obj.IssuedTo || "STANDARD AGENT",
        };

        // Final check: if it has no ID, it's not an invoice we can show
        if (mapped.invoiceId === "N/A" && !obj.invoiceId && !obj.InvoiceId) return null;

        return mapped;
      } catch (e) {
        return null;
      }
    }).filter((i: any) => i !== null);
    
    console.log(`[DEBUG] Returning ${data.length} valid invoices to frontend.`);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Invoice Query Error. Returning Mock Data:', error.message);
    return NextResponse.json({ 
      success: true, 
      data: MOCK_INVOICES,
      isMock: true
    }); 
  }
}
