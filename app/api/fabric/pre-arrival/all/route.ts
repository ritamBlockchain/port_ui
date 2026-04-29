import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';
import { MOCK_SUBMISSIONS } from '@/lib/fabric/mock-data';

export async function GET() {
  try {
    const query = 'prefix:prearrival:';
    console.log('Fetching live data from Fabric...');
    const result = await evaluateTransaction('QueryAssets', query);
    
    const rawData = JSON.parse(result.toString());
    const data = rawData.map((item: string) => JSON.parse(item));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('FABRIC CONNECTION FAILED. FALLING BACK TO MOCK DATA:', error.message);
    
    // Return mock data with success: true to keep the UI functional
    return NextResponse.json({ 
      success: true, 
      data: MOCK_SUBMISSIONS,
      isMock: true,
      error: 'Fabric connection offline. Displaying demo data.'
    });
  }
}
