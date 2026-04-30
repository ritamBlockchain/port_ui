import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';
export async function GET() {
  try {
    const query = 'prefix:cred:';
    console.log('Fetching live credentials from Fabric...');
    const result = await evaluateTransaction('QueryAssets', query);
    
    const resultString = result.toString();
    const rawData = resultString && resultString.trim() !== '' ? JSON.parse(resultString) : [];
    const data = rawData.map((item: string) => JSON.parse(item));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Fabric Credentials Fetch Failed:', error.message);
    return NextResponse.json({ 
      success: false, 
      data: [],
      error: error.message
    });
  }
}
