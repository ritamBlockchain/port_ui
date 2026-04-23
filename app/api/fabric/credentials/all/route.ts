import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET() {
  try {
    // We use a prefix-based range query which is 100% compatible with both LevelDB and CouchDB.
    const query = 'prefix:cred:';

    console.log('Fetching live credentials using Prefix Query...');
    const result = await evaluateTransaction('QueryAssets', query);
    
    const resultString = result.toString();
    const rawData = resultString && resultString.trim() !== '' ? JSON.parse(resultString) : [];
    const data = rawData.map((item: string) => JSON.parse(item));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.warn('Fabric Credentials Fetch Failed - Ensure the contract is Sequence 22+:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch live credentials'
    }, { status: 500 });
  }
}
