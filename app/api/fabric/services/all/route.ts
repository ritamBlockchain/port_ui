import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET() {
  try {
    // Prefix scan for all service logs (svclog:*)
    const query = 'prefix:svclog:';

    console.log('Fetching live service logs using Prefix Query...');
    const result = await evaluateTransaction('QueryAssets', query);
    const resultString = result.toString();

    if (!resultString || resultString.trim() === '') {
      return NextResponse.json({ success: true, data: [] });
    }
    
    const rawData = JSON.parse(resultString);
    const data = rawData.map((item: string) => JSON.parse(item));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Fabric Service Logs Fetch Failed:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch live service logs'
    }, { status: 500 });
  }
}
