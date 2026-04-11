import { NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET() {
  try {
    // Correctly using QueryAssets to fetch all invoices
    const result = await evaluateTransaction('QueryAssets', '{"selector":{"invoiceId":{"$gt":null}}}');
    const rawData = JSON.parse(result.toString());
    const data = rawData.map((item: string) => JSON.parse(item));
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Invoice Query Error:', error);
    return NextResponse.json({ success: false, data: [] }); 
  }
}
