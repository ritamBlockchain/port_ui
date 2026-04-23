import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET(request: NextRequest) {
  try {
    // Query all service requests using prefix query
    const result = await evaluateTransaction('QueryAssets', 'prefix:svcreq:');
    
    // Convert Buffer to string array
    const resultArray = Array.isArray(result) ? result : [result];
    const stringResults = resultArray.map((item: any) => 
      typeof item === 'string' ? item : item.toString()
    );
    
    const requests = stringResults
      .map((item: string) => {
        try {
          return JSON.parse(item);
        } catch {
          return null;
        }
      })
      .filter((item: any) => item !== null && item.requestId);

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Service requests fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service requests', details: String(error) },
      { status: 500 }
    );
  }
}
