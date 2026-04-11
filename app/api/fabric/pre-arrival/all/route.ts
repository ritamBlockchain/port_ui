import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET() {
  try {
    // We use a prefix-based range query which is 100% compatible with both LevelDB and CouchDB.
    // The contract logic I added handles "prefix:" by doing a GetStateByRange.
    const query = 'prefix:prearrival:';

    console.log('Fetching live data using high-compatibility Prefix Query...');
    const result = await evaluateTransaction('QueryAssets', query);
    
    const rawData = JSON.parse(result.toString());
    const data = rawData.map((item: string) => JSON.parse(item));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('CRITICAL FABRIC CONNECTION ERROR:', error.message);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch live data from Hyperledger Fabric'
    }, { status: 500 });
  }
}
