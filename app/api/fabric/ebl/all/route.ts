import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET() {
  try {
    const query = 'prefix:ebl:';
    console.log('Fetching all eBLs from Fabric...');
    const result = await evaluateTransaction('QueryAssets', query);
    
    const resultString = result.toString();
    const rawData = resultString && resultString.trim() !== '' ? JSON.parse(resultString) : [];
    const data = rawData.map((item: string) => {
      const obj = JSON.parse(item);
      return {
        eblId: obj.eblId || obj.ID || obj.id,
        ...obj
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Fabric EBL All connection failed:', error.message);
    return NextResponse.json({ 
      success: false, 
      data: [],
      error: error.message
    });
  }
}
