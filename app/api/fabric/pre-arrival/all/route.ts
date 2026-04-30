import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';
export async function GET() {
  try {
    const query = 'prefix:prearrival:';
    console.log('Fetching live data from Fabric...');
    const result = await evaluateTransaction('QueryAssets', query);
    
    const rawData = JSON.parse(result.toString());
    const data = rawData.map((item: string) => JSON.parse(item));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('FABRIC CONNECTION FAILED:', error.message);
    
    return NextResponse.json({ 
      success: false, 
      data: [],
      error: error.message
    });
  }
}
