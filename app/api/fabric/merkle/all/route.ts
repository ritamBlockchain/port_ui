import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';
import { MOCK_LEAVES } from '@/lib/fabric/mock-data';

export async function GET() {
  try {
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
    console.error('Fabric Merkle All connection failed. Returning Mock Data:', error.message);
    return NextResponse.json({ 
      success: true, 
      data: MOCK_LEAVES,
      isMock: true
    });
  }
}
