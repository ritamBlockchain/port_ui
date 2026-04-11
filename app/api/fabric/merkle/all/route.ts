import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET() {
  try {
    // Prefix scan for all Merkle leaves (merkle:leaf:*)
    const query = 'prefix:merkle:leaf:';


    console.log('Fetching live Merkle Audit Leaves from Ledger...');
    const result = await evaluateTransaction('QueryAssets', query);
    const resultString = result.toString();
    
    if (!resultString || resultString.trim() === '') {
      return NextResponse.json({ success: true, data: [] });
    }

    const rawData = JSON.parse(resultString);
    const data = rawData.map((item: string) => JSON.parse(item));

    // Sort by timestamp descending
    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Fabric Merkle Fetch Failed:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch Merkle audit trail'
    }, { status: 500 });
  }
}
