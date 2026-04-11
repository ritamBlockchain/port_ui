import { NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET() {
  try {
    // Standardize on prefix-based queries for consistency and to avoid cross-asset field name collisions
    const result = await evaluateTransaction('QueryAssets', 'prefix:invoice:');
    const rawData = JSON.parse(result.toString());
    const data = rawData.map((item: string) => JSON.parse(item));
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Invoice Query Error:', error);
    return NextResponse.json({ success: false, data: [] }); 
  }
}
